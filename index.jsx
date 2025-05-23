import React, { useEffect, useState } from "react";
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView,
  useWindowDimensions,
  FlatList,
} from "react-native";
import Deeplink from "./Deeplink";
import Text from "./Text";
import X from "./X";
const testId = "react-native-in-app-debugger-close-button";

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
import useApiInterceptor from "./Api/useApiInterceptor";
import useStateRef from "./useStateRef";
import Libs from "./Libs";
import Mock from "./Mock";
import MockDetails from "./Mock/MockDetails";

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
  tabs = [],
}) => {
  const deeplinkPrefix = variables?.DEEPLINK_PREFIX;
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
        LocalStorage.getItem("in-app-debugger-blacklist").then(
          (d) => d && setBlacklists(JSON.parse(d))
        );
      }, 4000);
    }, []);
  }

  const { apis, ...restApiInterceptor } = useApiInterceptor(
    maxNumOfApiToStore,
    blacklists,
    blacklistRef
  );

  const [tab, setTab] = useState("api");
  const [mocks, setMocks] = useState([]);
  const [mockDetails, setMockDetails] = useState();

  const goToMock = (d) => {
    setMockDetails(d);
    //setTab('mock');
  };

  const deleteMock = (id) => setMocks((v) => v.filter((i) => i.id !== id));

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
  const [disapear, setDisapear] = useState();
  if (disapear) return null;

  return (
    <Animated.View
      style={{
        transform: [{ translateX }, { translateY }],
        position: "absolute",
        borderRadius,
        borderColor: isOpen ? undefined : "white",
        borderWidth: 0.5,
        backgroundColor: "#000000" + (isOpen ? "ee" : "bb"),
        height,
        width,
        zIndex: 999999999,
        borderTopRightRadius: numPendingApiCalls || errors ? 0 : undefined,
      }}
      {...(isOpen ? {} : panResponder.panHandlers)}
    >
      <Text
        accessibilityLabel={testId}
        testId={testId}
        accessible
        onPress={() => setDisapear(true)}
        style={{ height: 1, width: 1, left: 10 }}
      />
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
        <>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.labelContainer}>
              {displayLabels.map((l) => (
                <Label key={l}>{l}</Label>
              ))}
            </View>
            <View style={{ flexDirection: "row", padding: 5, gap: 6 }}>
              <FlatList
                style={{ flex: 1 }}
                data={[
                  "api",
                  "mock",
                  !!variables && "vars",
                  "deeplink",
                  "libs",
                  ...tabs.map((t) => t.title),
                ].filter(Boolean)}
                keyExtractor={(item) => item}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => {
                  const isSelected = item === tab;
                  return (
                    <TouchableOpacity
                      onPress={() => setTab(item)}
                      activeOpacity={isSelected ? 1 : 0.7}
                      style={{
                        paddingHorizontal: 8,
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
                        {item}
                        {!index && !!apis.length && (
                          <Text> ({apis.length})</Text>
                        )}
                        {index === 1 && !!mocks.length && (
                          <Text> ({mocks.length})</Text>
                        )}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
              <X style={{ marginRight: 5 }} onPress={() => setIsOpen(false)} />
            </View>
            {tab === "vars" && <Variables variables={variables} />}
            {tab === "mock" && (
              <Mock {...{ mocks, setMocks, deleteMock, setMockDetails }} />
            )}
            {tab === "deeplink" && (
              <Deeplink
                deeplinkPrefix={deeplinkPrefix}
                onClose={() => setIsOpen(false)}
              />
            )}
            {tab === "libs" && <Libs />}
            {tab === "api" && (
              <Api
                {...{
                  apis,
                  setBlacklists,
                  blacklists,
                  maxNumOfApiToStore,
                  goToMock,
                }}
                {...restApiInterceptor}
              />
            )}
            {!!CustomTabComponent && <CustomTabComponent />}
          </SafeAreaView>
          <MockDetails
            {...{ mockDetails, setMockDetails, setMocks, deleteMock, mocks }}
          />
        </>
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
