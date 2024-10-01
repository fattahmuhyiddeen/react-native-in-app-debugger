import { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, PanResponder, useWindowDimensions } from 'react-native';

let LocalStorage;
try {
  LocalStorage = require('@react-native-async-storage/async-storage/src').default;
} catch (error) {
  // console.error("Error importing LocalStorage:", error);
}

const defaultBadgeWidth = 110;
const defaultBorderRadius = 10;
const und = { useNativeDriver: false };
const touchThreshold = 10;

export default (defaultBadgeHeight) => {
  const cachePosition = useRef({ x: 0, y: 50 });
  const position = useRef<any>(new Animated.ValueXY(cachePosition.current)).current;
  // initially I want to animate border radius, but user dont really notice, therefore I removed unnecessary animation
  // const borderRadius = useRef(new Animated.Value(defaultBorderRadius)).current;
  const badgeHeight = useRef(new Animated.Value(defaultBadgeHeight)).current;
  const badgeWidth = useRef(new Animated.Value(defaultBadgeWidth)).current;
  const { width, height } = useWindowDimensions();
  const [isOpen, setIsOpen] = useState(false);
  const [shouldShowDetails, setShouldShowDetails] = useState(false);

  const move = (toValue) => {
    cachePosition.current = toValue;
    Animated.spring(position, { ...und, toValue }).start();
    LocalStorage?.setItem('in-app-debugger-position', JSON.stringify(toValue));
  };

  if (LocalStorage) {
    useEffect(() => {
      LocalStorage.getItem('in-app-debugger-position').then((d) => {
        if (d) move(JSON.parse(d));
      });
    }, []);
  }

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      !isOpen && Animated.spring(position, { ...und, toValue: { x: cachePosition.current.x, y: 0 } }).start();
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      !isOpen && Animated.spring(position, { ...und, toValue: cachePosition.current }).start();
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [isOpen]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        return Math.abs(dx) > touchThreshold || Math.abs(dy) > touchThreshold;
      },
      onPanResponderGrant: () => {
        position.setOffset({ x: position.x._value, y: position.y._value });
      },
      onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], und),
      onPanResponderRelease: (_, g) => {
        position.flattenOffset();
        move({
          x: g.moveX > width / 2 ? width - defaultBadgeWidth : 0,
          y: Math.min(g.moveY, height - defaultBadgeHeight),
        });
      },
    }),
  ).current;

  useEffect(() => {
    Animated.spring(badgeHeight, { toValue: isOpen ? height : defaultBadgeHeight, ...und }).start();
  }, [defaultBadgeHeight]);

  useEffect(() => {
    setTimeout(() => setShouldShowDetails(isOpen), isOpen ? 200 : 0);
    Animated.spring(position, { toValue: isOpen ? { x: 0, y: 0 } : cachePosition.current, ...und }).start();
    // Animated.spring(borderRadius, { toValue: isOpen ? 0 : defaultBorderRadius, ...und }).start();
    Animated.spring(badgeHeight, { toValue: isOpen ? height : defaultBadgeHeight, ...und }).start();
    Animated.spring(badgeWidth, { toValue: isOpen ? width : defaultBadgeWidth, ...und }).start();
  }, [isOpen]);

  return {
    height: badgeHeight,
    width: badgeWidth,
    panResponder,
    translateX: position.x,
    translateY: position.y,
    isOpen,
    setIsOpen,
    borderRadius: isOpen ? 0 : defaultBorderRadius,
    shouldShowDetails,
  };
};
