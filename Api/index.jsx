import React, { useEffect, useState } from "react";
import {
  SectionList,
  TextInput,
  View,
  Alert,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import Text from "../Text";
import Highlight from "../Highlight";
import Bookmark from "../Bookmark";
import X from "../X";
import getRandomBrightColor from "../utils/getRandomBrightColor";
import { MAX_URL_LENGTH } from "./Row";
let Clipboard;
try {
  Clipboard = require("@react-native-clipboard/clipboard").default;
} catch (error) {
  // console.error("Error importing Clipboard:", error);
}

let LocalStorage;
try {
  LocalStorage =
    require("@react-native-async-storage/async-storage/src").default;
} catch (error) {
  // console.error("Error importing LocalStorage:", error);
}

import Row from "./Row";

const BlacklistIcon = () => (
  <View style={{ borderRadius: 100, backgroundColor: "black" }}>
    <X size={12} />
  </View>
);

const isError = (a) => a.response?.status < 200 || a.response?.status >= 400;
export default (props) => {
  const [filter, setFilter] = useState("");
  const [errorOnly, setErrorOnly] = useState(false);
  const [showBookmarkOnly, setShowBookmarkOnly] = useState(false);
  const [wrap, setWrap] = useState(true);
  const [expands, setExpands] = useState({});
  const apis = props.apis.filter((a) => !errorOnly || isError(a));

  if (LocalStorage) {
    useEffect(() => {
      LocalStorage.getItem("in-app-debugger-api-filter").then(setFilter);
    }, []);
    useEffect(() => {
      LocalStorage.setItem("in-app-debugger-api-filter", filter);
    }, [filter]);
  }

  const hasError = apis.some(isError);

  return (
    <>
      <View style={styles.container}>
        {!!apis.length && !filter && (
          <Pressable
            style={styles.actionButton}
            onPress={() =>
              Alert.alert("Are you sure", "You want to clear all logs", [
                { text: "Delete", onPress: props.clear, style: "cancel" },
                { text: "Cancel" },
              ])
            }
          >
            <Text style={{ color: "black", fontSize: 10 }}>Clear logs</Text>
          </Pressable>
        )}
        {hasError && !filter && (
          <Pressable
            style={{ padding: 5 }}
            onPress={() => setErrorOnly((v) => !v)}
          >
            <Text
              style={{
                color: "red",
                textDecorationLine: errorOnly ? "line-through" : undefined,
                fontSize: 10,
              }}
            >
              {apis.filter(isError).length} error
              {apis.filter(isError).length > 1 ? "s" : ""}
            </Text>
          </Pressable>
        )}
        {!!props.blacklists.length && !filter && (
          <Pressable
            style={styles.actionButton}
            onPress={() =>
              Alert.alert("Are you sure", "You want to clear all blacklists", [
                {
                  text: "Clear",
                  onPress: () => props.setBlacklists(),
                  style: "cancel",
                },
                { text: "Cancel" },
              ])
            }
          >
            <Text style={{ color: "black", fontSize: 10 }}>
              Clear {props.blacklists.length}
            </Text>
            <BlacklistIcon />
          </Pressable>
        )}
        {!!Object.keys(props.bookmarks).length && (
          <>
            <Pressable
              style={styles.actionButton}
              onPress={() => setShowBookmarkOnly((v) => !v)}
            >
              <Bookmark size={7} />
              <Text style={{ color: "black", fontSize: 10 }}>
                {showBookmarkOnly ? "& others" : "Only"}
              </Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => props.setBookmarks({})}
            >
              <Text style={{ color: "black", fontSize: 10 }}>
                Clear {Object.keys(props.bookmarks).length}
              </Text>
              <Bookmark size={7} />
            </Pressable>
          </>
        )}
        {apis.some((a) => !a.response) && (
          <ActivityIndicator size="small" color="white" />
        )}
        <TextInput
          value={filter}
          placeholder="Filter..."
          clearButtonMode="always"
          placeholderTextColor="grey"
          style={styles.textInput}
          onChangeText={(t) => setFilter(t.toLowerCase())}
        />
      </View>
      {!filter &&
        !!props.maxNumOfApiToStore &&
        apis.length >= props.maxNumOfApiToStore && (
          <Text style={{ color: "#ffffff88", padding: 10 }}>
            Capped to only latest {props.maxNumOfApiToStore} APIs
          </Text>
        )}
      <SectionList
        keyExtractor={(i) => i.id}
        stickySectionHeadersEnabled
        showsVerticalScrollIndicator
        sections={apis
          .filter(
            (a) =>
              !filter ||
              a.request.url.toLowerCase().includes(filter) ||
              JSON.stringify(a.response?.data).toLowerCase().includes(filter)
          )
          .filter((a) => !showBookmarkOnly || props.bookmarks[a.id])
          .map((data) => ({ data: [data], id: data.id }))}
        renderItem={(i) =>
          expands[i.item.id] ? (
            <Row {...i} {...{ wrap, setWrap, filter }} />
          ) : (
            <View style={{ height: 20 }} />
          )
        }
        renderSectionHeader={({
          section: {
            data: [item],
          },
        }) => {
          const hasResponse = !!item.response;

          const duration = item.response?.timestamp
            ? ~~(item.response?.timestamp - item.request.timestamp) / 1000
            : 0;
          const isExpand = expands[item.id];
          const bookmarkColor = props.bookmarks[item.id];
          const color = !!item.mockid
            ? "#77e"
            : hasResponse
            ? item.response.error
              ? "red"
              : "white"
            : "yellow";

          return (
            <View style={styles.rowHeader}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", gap: 5 }}>
                  <Bookmark
                    color={bookmarkColor}
                    onPress={() => {
                      props.setBookmarks((v) => {
                        if (!bookmarkColor)
                          return { ...v, [item.id]: getRandomBrightColor() };
                        const newV = { ...v };
                        delete newV[item.id];
                        return newV;
                      });
                    }}
                  />
                  <Text style={{ color: "#555", fontSize: 8 }}>
                    {item.id + "\n"}
                  </Text>
                </View>
                <Text selectable style={{ flex: 1, color }}>
                  <Text style={{ opacity: 0.7 }}>
                    {item.request.method +
                      ` (${item.response?.status ?? "no response"})` +
                      " - " +
                      item.request.time +
                      (!!item.mockid ? "   < mocked >" : hasResponse ? " - " + duration + " second(s)" : "") +
                      "\n"}
                  </Text>
                  <Highlight
                    text={item.request.url.slice(0, MAX_URL_LENGTH)}
                    filter={filter}
                  />
                  {item.request.url.length > MAX_URL_LENGTH && "......."}
                </Text>
              </View>
              <View style={{ gap: 4 }}>
                <Pressable
                  onPress={() =>
                    setExpands((v) => {
                      if (!isExpand) return { ...v, [item.id]: true };
                      const newV = { ...v };
                      delete newV[item.id];
                      return newV;
                    })
                  }
                  style={styles.actionButton}
                >
                  <Text style={{ color: "black", fontSize: 10 }}>
                    {isExpand ? "Hide" : "Show"}
                  </Text>
                </Pressable>
                {!!Clipboard?.setString && (
                  <Pressable
                    onPress={() => {
                      const content = { ...item };
                      delete content.id;
                      Clipboard.setString(
                        JSON.stringify(content, undefined, 3)
                      );
                      Alert.alert("Copied");
                    }}
                    style={styles.actionButton}
                  >
                    <Text style={{ color: "black", fontSize: 10 }}>Copy</Text>
                  </Pressable>
                )}
                {isExpand && (
                  <Pressable
                    onPress={() => {
                      Alert.alert(
                        "Are you sure",
                        `You want to blacklist: \n\n(${item.request.method}) ${item.request.url} \n\nwhere all history logs for this API will be removed and all future request for this API will not be recorded?`,
                        [
                          {
                            text: "Blacklist",
                            onPress: () =>
                              props.setBlacklists({
                                method: item.request.method,
                                url: item.request.url,
                              }),
                            style: "cancel",
                          },
                          { text: "Cancel" },
                        ]
                      );
                    }}
                    style={styles.actionButton}
                  >
                    <Text style={{ color: "black", fontSize: 10 }}>
                      Blacklist{" "}
                    </Text>
                    <BlacklistIcon />
                  </Pressable>
                )}
                {isExpand && item.interface === "axios" && !!item.mockid && (
                  <Pressable
                    onPress={() => props.goToMock({ ...item, id: item.mockid })}
                    style={styles.actionButton}
                  >
                    <Text style={{ color: "black", fontSize: 10 }}>
                      Edit Mock
                    </Text>
                  </Pressable>
                )}
                {isExpand && item.interface === "axios" && (
                  <Pressable
                    onPress={() => props.goToMock(item)}
                    style={styles.actionButton}
                  >
                    <Text style={{ color: "black", fontSize: 10 }}>
                      {item.mockid ? "New " : ""}Mock
                    </Text>
                  </Pressable>
                )}
                {isExpand && (
                  <Pressable
                    onPress={() => props.deleteApi(item.id)}
                    style={styles.actionButton}
                  >
                    <Text style={{ color: "black", fontSize: 10 }}>Delete</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 5,
    alignItems: "center",
    gap: 5,
  },
  actionButton: {
    backgroundColor: "white",
    borderRadius: 5,
    padding: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  rowHeader: {
    flexDirection: "row",
    gap: 5,
    backgroundColor: "black",
    padding: 5,
    paddingTop: 10,
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 5,
    shadowOpacity: 1,
    // TODO shadow not working on android
    elevation: 10,
    zIndex: 99,
  },
  textInput: {
    padding: 5,
    color: "white",
    flex: 1,
    minWidth: 100,
    backgroundColor: "#333",
    borderRadius: 8,
  },
});
