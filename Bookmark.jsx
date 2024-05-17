import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export default ({ size = 10, color = '#333333', onPress }) => {
  const tristyle = { borderRightWidth: size / 2, borderTopWidth: size / 2, borderTopColor: color };
  return (
    <View>
      <View style={{ width: size, height: size, backgroundColor: color }} />
      <View style={{ flexDirection: 'row' }}>
        <View style={[styles.triangleCorner, tristyle]} />
        <View style={[styles.triangleCorner, tristyle, { transform: [{ rotate: '90deg' }] }]} />
      </View>
      <Pressable
        onPress={onPress}
        style={[
          {
            width: size,
            height: size + size / 2,
          },
          styles.pressable,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  triangleCorner: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightColor: 'transparent',
  },
  pressable: {
    position: 'absolute',
    transform: [{ scale: 1.7 }],
  },
});
