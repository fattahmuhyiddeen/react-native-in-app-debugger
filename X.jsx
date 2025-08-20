import React from "react";
import { StyleSheet, Pressable, View } from "react-native";

const height = 3;
export default ({ size = 20, color = "white", style = {}, ...rest }) => {
  const panelStyle = { top: size / 2, width: size, backgroundColor: color };
  const Component = rest.onPress ? Pressable : View;
  return (
    <Component
      {...rest}
      style={{
        ...style,
        width: size,
        height: size,
        transform: [{ scale: 2 }],
      }}
    >
      <View style={{ width: size, height: size, transform: [{ scale: 0.5 }] }}>
        <View
          style={[
            styles.panel,
            panelStyle,
            { transform: [...styles.panel.transform, { rotate: "45deg" }] },
          ]}
        />
        <View
          style={[
            styles.panel,
            panelStyle,
            { transform: [...styles.panel.transform, { rotate: "-45deg" }] },
          ]}
        />
      </View>
    </Component>
  );
};

const styles = StyleSheet.create({
  panel: {
    height,
    transform: [{ translateY: -height / 2 }],
    position: "absolute",
  },
});
