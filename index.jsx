import React, { useEffect, useState } from "react";
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView,
  useWindowDimensions,
} from "react-native";
import Text from "./Text";
import X from "./X";

let DeviceInfo;
try {
  DeviceInfo = require("react-native-device-info");
} catch (error) {
  // console.error("Error importing DeviceInfo:", error);
}

let LocalStorage;
try {
  LocalStorage =
    require("@react-native-async-storage/async-storage/src").default;
} catch (error) {
  // console.error("Error importing LocalStorage:", error);
}

import useAnimation from "./useAnimation";
import Variables from "./Variables";
import Api from "./Api";
import useApiInterceptor from "./useApiInterceptor";
import useStateRef from "./useStateRef";
import Libs from "react-native-in-app-debugger/Libs";

const fontSize = 7;

let v = "";
let modelOs;
if (DeviceInfo) {
  let model = DeviceInfo.getDeviceId();
  if (model === "unknown") model = DeviceInfo.getModel();
  modelOs = model + " - " + DeviceInfo.getSystemVersion();
  const pcs = DeviceInfo.getReadableVersion().split(".");
  const lastPc = pcs.pop();
  v = pcs.join(".") + "-" + lastPc;
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
  interceptResponse,
  tabs = [],
}) => {
  const [blacklists, setB, blacklistRef] = useStateRef([]);
  const dimension = useWindowDimensions();

  const setBlacklists = (d) => {
    if (!d) {
      setB([]);
      LocalStorage?.removeItem("in-app-debugger-blacklist");
    } else {
      setB((v) => {
        const newValue = Array.isArray(d) ? d : [...v, d];
        LocalStorage?.setItem(
          "in-app-debugger-blacklist",
          JSON.stringify(newValue)
        );
        return newValue;
      });
    }
  };

  if (LocalStorage) {
    useEffect(() => {
      setTimeout(() => {
        LocalStorage.getItem("in-app-debugger-blacklist").then((d) => {
          if (d) {
            setBlacklists(JSON.parse(d));
          }
        });
      }, 4000);
    }, []);
  }

  const { apis, ...restApiInterceptor } = useApiInterceptor(
    maxNumOfApiToStore,
    blacklists,
    interceptResponse,
    blacklistRef
  );

  const [tab, setTab] = useState("api");

  const errors = apis.filter((a) => a.response?.error).length;
  const numPendingApiCalls = apis.filter((a) => !a.response).length;
  let badgeHeight = fontSize * 3;

  const displayLabels = [
    (!!env || !!version) && (env || "") + (env ? " " : "") + version,
    modelOs,
    ~~dimension.width + " x " + ~~dimension.height,
    variables?.GIT_BRANCH,
    variables?.BUILD_DATE_TIME,
    ...labels,
  ].filter(Boolean);

  displayLabels.forEach(() => (badgeHeight += fontSize + 1));

  const {
    translateX,
    translateY,
    borderRadius,
    width,
    height,
    isOpen,
    panResponder,
    setIsOpen,
    shouldShowDetails,
  } = useAnimation(badgeHeight);

  const CustomTabComponent = tabs.find((t) => tab === t.title)?.component;
  return (
    <Animated.View
      style={{
        transform: [{ translateX }, { translateY }],
        position: "absolute",
        borderRadius,
        backgroundColor: "#000000" + (isOpen ? "ee" : "bb"),
        height,
        width,
        borderTopRightRadius: numPendingApiCalls || errors ? 0 : undefined,
      }}
      {...(isOpen ? {} : panResponder.panHandlers)}
    >
      {!shouldShowDetails ? (
        <TouchableOpacity
          onPress={() => setIsOpen(true)}
          style={styles.box}
          activeOpacity={0.8}
        >
          <View style={styles.badgeContainer}>
            {!!numPendingApiCalls && (
              <View style={[styles.badge, { backgroundColor: "orange" }]}>
                <Text style={{ fontSize, color: "white" }}>
                  {numPendingApiCalls}
                </Text>
              </View>
            )}
            {!!errors && (
              <View style={[styles.badge, { backgroundColor: "red" }]}>
                <Text style={{ fontSize, color: "white" }}>{errors}</Text>
              </View>
            )}
          </View>
          {displayLabels.map((l) => (
            <Label key={l}>{l}</Label>
          ))}
        </TouchableOpacity>
      ) : (
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.labelContainer}>
            {displayLabels.map((l) => (
              <Label key={l}>{l}</Label>
            ))}
          </View>
          <View style={{ flexDirection: "row", padding: 5, gap: 6 }}>
            <View style={{ flex: 1, flexDirection: "row" }}>
              {[
                "api",
                !!variables && "variables",
                "libs",
                ...tabs.map((t) => t.title),
              ]
                .filter(Boolean)
                .map((t, i) => {
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
                          textTransform: "uppercase",
                        }}
                      >
                        {t}
                        {!i && !!apis.length && <Text> ({apis.length})</Text>}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </View>
            <X style={{ marginRight: 5 }} onPress={() => setIsOpen(false)} />
          </View>
          {tab === "variables" && !!variables && (
            <Variables variables={variables} />
          )}
          {tab === "libs" && <Libs />}
          {tab === "api" && (
            <Api
              {...{ apis, setBlacklists, blacklists, maxNumOfApiToStore }}
              {...restApiInterceptor}
            />
          )}
          {!!CustomTabComponent && <CustomTabComponent />}
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
  label: { color: "white", textAlign: "center", fontSize: fontSize + 1 },
  badgeContainer: {
    gap: 3,
    flexDirection: "row",
    top: -10,
    right: -3,
    position: "absolute",
    zIndex: 999,
  },
  badge: {
    padding: 3,
    borderRadius: 999,
  },
  labelContainer: {
    backgroundColor: "black",
    flexDirection: "row",
    columnGap: 7,
    flexWrap: "wrap",
  },
});
