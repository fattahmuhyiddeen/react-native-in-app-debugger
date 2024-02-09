import { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, useWindowDimensions } from 'react-native';

const defaultBadgeWidth = 80;
const defaultBorderRadius = 20;
const und = { useNativeDriver: false };
const touchThreshold = 10;

export default (defaultBadgeHeight) => {
  const cachePosition = useRef({ x: 0, y: 50 });
  const position = useRef<any>(new Animated.ValueXY(cachePosition.current)).current;
  const borderRadius = useRef(new Animated.Value(defaultBorderRadius)).current;
  const badgeHeight = useRef(new Animated.Value(defaultBadgeHeight)).current;
  const badgeWidth = useRef(new Animated.Value(defaultBadgeWidth)).current;
  const { width, height } = useWindowDimensions();

  const [isOpen, setIsOpen] = useState(false);

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
        cachePosition.current = { x: g.moveX > width / 2 ? width - defaultBadgeWidth : 0, y: g.moveY };
        Animated.spring(position, { ...und, toValue: cachePosition.current }).start();
      },
    }),
  ).current;

  useEffect(() => {
    Animated.spring(position, { toValue: isOpen ? { x: 0, y: 0 } : cachePosition.current, ...und }).start();
    Animated.spring(borderRadius, { toValue: isOpen ? 0 : defaultBorderRadius, ...und }).start();
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
    borderRadius,
  };
};