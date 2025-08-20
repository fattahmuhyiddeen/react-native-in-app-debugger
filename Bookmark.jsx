import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export default ({ size = 10, color = '#222', ...rest }) => {
  const tristyle = { borderRightWidth: size / 2, borderTopWidth: size / 2, borderTopColor: color };
  const Component = rest.onPress ? Pressable : View;
  return (
    <Component {...rest} style={[styles.container, { height: size + size / 2 }]}>
      <View style={{ transform: [{ scale: 0.3 }] }}>
        <View style={{ width: size, height: size, backgroundColor: color }} />
        <View style={{ flexDirection: 'row' }}>
          <View style={[styles.triangleCorner, tristyle]} />
          <View style={[styles.triangleCorner, tristyle, { transform: [{ rotate: '90deg' }] }]} />
        </View>
      </View>
    </Component>
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
  container: {
    transform: [{ scale: 3 }],
  },
});
