import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from 'react';
import { Image } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import formatValue from '../../utils/formatValue';

import api from '../../services/api';

import {
  Container,
  Header,
  ScrollContainer,
  FoodsContainer,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
  AdditionalsContainer,
  Title,
  TotalContainer,
  AdittionalItem,
  AdittionalItemText,
  AdittionalQuantity,
  PriceButtonContainer,
  TotalPrice,
  QuantityContainer,
  FinishOrderButton,
  ButtonText,
  IconContainer,
} from './styles';

interface Params {
  id: number;
}

interface Extra {
  id: number;
  name: string;
  value: number;
  quantity: number;
}

interface Food {
  id: number;
  name: string;
  description: string;
  category: number;
  thumbnail_url: string;
  price: number;
  image_url: string;
  formattedPrice: string;
  extras: Extra[];
}

const FoodDetails: React.FC = () => {
  const [food, setFood] = useState({} as Food);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [foodQuantity, setFoodQuantity] = useState(1);

  const navigation = useNavigation();
  const route = useRoute();

  const routeParams = route.params as Params;

  useEffect(() => {
    async function loadFood(): Promise<void> {
      const response = await api.get(`/foods/${routeParams.id}`);

      const foodFormatted = {
        ...response.data,
        formattedPrice: formatValue(response.data.price),
      };

      const extraFormatted = foodFormatted.extras.map((extraFood: Extra) => {
        return {
          ...extraFood,
          quantity: 0,
        };
      });

      setFood(foodFormatted);
      setExtras(extraFormatted);
    }

    loadFood();
  }, [routeParams]);

  function handleIncrementExtra(id: number): void {
    setExtras(extrasFood => {
      const extrasFoodUpdated = extrasFood.map(extra => {
        if (extra.id === id) {
          const extraUpdated = Object.assign(extra, {
            quantity: extra.quantity + 1,
          });

          return extraUpdated;
        }

        return extra;
      });

      return extrasFoodUpdated;
    });
  }

  function handleDecrementExtra(id: number): void {
    setExtras(extrasFood => {
      const extrasFoodUpdated = extrasFood.map(extra => {
        if (extra.id === id) {
          const extraUpdated = Object.assign(extra, {
            quantity: extra.quantity > 0 ? extra.quantity - 1 : 0,
          });

          return extraUpdated;
        }

        return extra;
      });

      return extrasFoodUpdated;
    });
  }

  function handleIncrementFood(): void {
    setFoodQuantity(foodQuantityValue => foodQuantityValue + 1);
  }

  function handleDecrementFood(): void {
    setFoodQuantity(foodQuantityValue =>
      foodQuantityValue > 1 ? foodQuantityValue - 1 : 1,
    );
  }

  const toggleFavorite = useCallback(async () => {
    setIsFavorite(!isFavorite);

    await api.post(`/favorites`, {
      id: Math.random() * 100 + 3,
      name: food.name,
      description: food.description,
      price: food.price,
      category: food.category,
      image_url: food.image_url,
      thumbnail_url: food.thumbnail_url,
    });
  }, [isFavorite, food]);

  const cartTotal = useMemo(() => {
    const extrasTotalValue = extras.reduce(
      (accumulator: number, extra: Extra) => {
        return accumulator + extra.value * extra.quantity;
      },
      0,
    );

    const foodPrice = food.price;

    const totalOrder = (extrasTotalValue + foodPrice) * foodQuantity;

    return formatValue(totalOrder);
  }, [extras, food, foodQuantity]);

  async function handleFinishOrder(): Promise<void> {
    const data = {
      ...food,
      id: Math.random() * 100 + 20,
      extras,
    };

    await api.post('/orders', data);

    navigation.goBack();
  }

  // Calculate the correct icon name
  const favoriteIconName = useMemo(
    () => (isFavorite ? 'favorite' : 'favorite-border'),
    [isFavorite],
  );

  useLayoutEffect(() => {
    // Add the favorite icon on the right of the header bar
    navigation.setOptions({
      headerRight: () => (
        <MaterialIcon
          name={favoriteIconName}
          size={24}
          color="#FFB84D"
          onPress={() => toggleFavorite()}
        />
      ),
    });
  }, [navigation, favoriteIconName, toggleFavorite]);

  return (
    <Container>
      <Header />

      <ScrollContainer>
        <FoodsContainer>
          <Food>
            <FoodImageContainer>
              <Image
                style={{ width: 327, height: 183 }}
                source={{
                  uri: food.image_url,
                }}
              />
            </FoodImageContainer>
            <FoodContent>
              <FoodTitle>{food.name}</FoodTitle>
              <FoodDescription>{food.description}</FoodDescription>
              <FoodPricing>{food.formattedPrice}</FoodPricing>
            </FoodContent>
          </Food>
        </FoodsContainer>
        <AdditionalsContainer>
          <Title>Adicionais</Title>
          {extras.map(extra => (
            <AdittionalItem key={extra.id}>
              <AdittionalItemText>{extra.name}</AdittionalItemText>
              <AdittionalQuantity>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="minus"
                  onPress={() => handleDecrementExtra(extra.id)}
                  testID={`decrement-extra-${extra.id}`}
                />
                <AdittionalItemText testID={`extra-quantity-${extra.id}`}>
                  {extra.quantity}
                </AdittionalItemText>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="plus"
                  onPress={() => handleIncrementExtra(extra.id)}
                  testID={`increment-extra-${extra.id}`}
                />
              </AdittionalQuantity>
            </AdittionalItem>
          ))}
        </AdditionalsContainer>
        <TotalContainer>
          <Title>Total do pedido</Title>
          <PriceButtonContainer>
            <TotalPrice testID="cart-total">{cartTotal}</TotalPrice>
            <QuantityContainer>
              <Icon
                size={15}
                color="#6C6C80"
                name="minus"
                onPress={handleDecrementFood}
                testID="decrement-food"
              />
              <AdittionalItemText testID="food-quantity">
                {foodQuantity}
              </AdittionalItemText>
              <Icon
                size={15}
                color="#6C6C80"
                name="plus"
                onPress={handleIncrementFood}
                testID="increment-food"
              />
            </QuantityContainer>
          </PriceButtonContainer>

          <FinishOrderButton onPress={() => handleFinishOrder()}>
            <ButtonText>Confirmar pedido</ButtonText>
            <IconContainer>
              <Icon name="check-square" size={24} color="#fff" />
            </IconContainer>
          </FinishOrderButton>
        </TotalContainer>
      </ScrollContainer>
    </Container>
  );
};

export default FoodDetails;
