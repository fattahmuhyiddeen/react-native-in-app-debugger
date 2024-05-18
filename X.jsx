import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default ({ size = 20, color = 'white', onPress }) => {
  const panelStyle = { top: size / 2, width: size, backgroundColor: color };
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: size,
        height: size,
        transform: [{ scale: 1.7 }],
      }}
    >
      <View style={{ width: size, height: size, transform: [{ scale: 0.5 }] }}>
        <View style={[styles.panel, panelStyle, { transform: [{ rotate: '45deg' }] }]} />
        <View style={[styles.panel, panelStyle, { transform: [{ rotate: '-45deg' }] }]} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  panel: {
    height: 3,
    position: 'absolute',
  },
});
