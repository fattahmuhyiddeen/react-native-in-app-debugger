/* eslint-disable react-hooks/rules-of-hooks */
// hooks are prevented to be called conditionally, but in this case, bundle id / package name will never changed in run time, so it is safe to call the hooks under that condition

import React, { useState } from "react";
import {
  Animated,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView,
  Dimensions,
} from "react-native";
// const DeviceInfo = React.lazy(() =>
//   import("react-native-device-info").catch(() => ({ default: null }))
// );

let DeviceInfo;
try {
  DeviceInfo = require("react-native-device-info");
} catch (error) {
  // console.error("Error importing DeviceInfo:", error);
}

import useAnimation from "./useAnimation";
import Variables from "./Variables";
import Api from "./Api";
import useApiInterceptor from "./useApiInterceptor";

const dimension = Dimensions.get("window");

const v = DeviceInfo?.getReadableVersion() || "";

let modelOs;
if (DeviceInfo) {
  let model = DeviceInfo.getDeviceId();
  if (model === "unknown") model = DeviceInfo.getModel();
  modelOs = model + " - " + DeviceInfo.getSystemVersion();
}

const Label = (props) => (
  <Text
    {...props}
    numberOfLines={1}
    ellipsizeMode="tail"
    style={[styles.label, props.style]}
  />
);

export default ({
  variables,
  env,
  version = v,
  maxNumOfApiToStore = 0,
  labels = [],
}) => {
  const { apis, clear } = useApiInterceptor(maxNumOfApiToStore);

  const [tab, setTab] = useState("api");

  const errors = apis.filter((a) => a.response?.error).length;
  const numPendingApiCalls = apis.filter((a) => !a.response).length;
  let badgeHeight = 10;
  if (variables?.GIT_BRANCH) badgeHeight += 10;
  if (variables?.BUILD_DATE_TIME) badgeHeight += 10;
  const hasEnvOrVersion = !!env || !!version;
  if (hasEnvOrVersion) badgeHeight += 10;
  if (DeviceInfo) badgeHeight += 10;
  if (badgeHeight === 10) badgeHeight += 10;
  labels.forEach(() => (badgeHeight += 10));

  const {
    translateX,
    translateY,
    borderRadius,
    width,
    height,
    isOpen,
    panResponder,
    setIsOpen,
  } = useAnimation(badgeHeight);
  return (
    <Animated.View
      style={{
        transform: [{ translateX }, { translateY }],
        position: "absolute",
        borderRadius,
        backgroundColor: "#000000" + (isOpen ? "dd" : "bb"),
        height,
        width,
        borderTopRightRadius: numPendingApiCalls || errors ? 0 : undefined,
      }}
      {...(isOpen ? {} : panResponder.panHandlers)}
    >
      {!isOpen ? (
        <TouchableOpacity onPress={() => setIsOpen(true)} style={styles.box}>
          <View style={styles.badgeContainer}>
            {!!numPendingApiCalls && (
              <View style={[styles.badge, { backgroundColor: "orange" }]}>
                <Text style={{ fontSize: 8, color: "white" }}>
                  {numPendingApiCalls}
                </Text>
              </View>
            )}
            {!!errors && (
              <View style={[styles.badge, { backgroundColor: "red" }]}>
                <Text style={{ fontSize: 8, color: "white" }}>{errors}</Text>
              </View>
            )}
          </View>
          {(!!env || !!version) && (
            <Label>{(env || "") + (env ? " " : "") + version}</Label>
          )}
          {!!modelOs && <Label>{modelOs}</Label>}
          <Label>{dimension.width + " x " + dimension.height}</Label>
          {variables?.GIT_BRANCH && <Label>{variables.GIT_BRANCH}</Label>}
          {variables?.BUILD_DATE_TIME && (
            <Label>{variables.BUILD_DATE_TIME}</Label>
          )}
          {labels.map((l) => (
            <Label key={l}>{l}</Label>
          ))}
        </TouchableOpacity>
      ) : (
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", padding: 5 }}>
            <View style={{ flex: 1, flexDirection: "row" }}>
              {!!variables &&
                ["api", "variables"].map((t) => {
                  const isSelected = t === tab;
                  return (
                    <TouchableOpacity
                      onPress={() => setTab(t)}
                      activeOpacity={isSelected ? 1 : 0.7}
                      key={t}
                      style={{
                        flex: 1,
                        borderBottomWidth: +isSelected,
                        borderColor: "white",
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          opacity: isSelected ? 1 : 0.5,
                          textAlign: "center",
                        }}
                      >
                        {t.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </View>
            <TouchableOpacity onPress={() => setIsOpen(false)}>
              <Text style={styles.close}>X</Text>
            </TouchableOpacity>
          </View>
          {tab === "variables" && !!variables && (
            <Variables variables={variables} />
          )}
          {tab === "api" && (
            <Api
              apis={apis}
              clear={clear}
              maxNumOfApiToStore={maxNumOfApiToStore}
            />
          )}
        </SafeAreaView>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  box: {
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  label: { color: "white", textAlign: "center", fontSize: 6 },
  badgeContainer: {
    gap: 3,
    flexDirection: "row",
    top: -12,
    right: -3,
    position: "absolute",
    zIndex: 999,
  },
  badge: {
    padding: 4,
    borderRadius: 999,
  },
  close: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    paddingHorizontal: 10,
  },
});
