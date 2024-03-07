import React, { useState } from "react";
import {
  Text,
  SectionList,
  TextInput,
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
// import Clipboard from '@react-native-clipboard/clipboard';
let Clipboard;
try {
  Clipboard = require("@react-native-clipboard/clipboard")?.default;
} catch (error) {
  // console.error("Error importing Clipboard:", error);
}

const MAX_URL_LENGTH = 100;

const Row = ({ item }) => {
  const tabs = [
    { value: "Response Body" },
    { value: "Request Body", hide: !item.request.data },
    { value: "Request Header" },
  ];
  const [tab, setTab] = useState(tabs[0].value);
  const hasResponse = item.response;
  const Tab = ({ value, hide }) => {
    if (hide) return null;
    const isSelected = value === tab;
    return (
      <TouchableOpacity
        activeOpacity={isSelected ? 1 : 0.7}
        onPress={() => setTab(value)}
        style={[
          styles.selectionTab,
          { backgroundColor: isSelected ? "white" : undefined },
        ]}
      >
        <Text
          style={{
            color: isSelected ? "#000" : "#ffffff88",
            textAlign: "center",
          }}
        >
          {value}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.details}>
      {item.request.url.length > MAX_URL_LENGTH && (
        <Text style={{ color: "#ffffff99", paddingVertical: 20 }}>
          {item.request.url}
        </Text>
      )}
      <View>
        <View style={{ flexDirection: "row" }}>
          {tabs.map((t) => (
            <Tab key={t.value} {...t} />
          ))}
        </View>

        {tab === tabs[0].value && hasResponse && (
          <Text style={{ color: "white" }}>
            {JSON.stringify(item.response.data, undefined, 4)}
          </Text>
        )}
        {tab === tabs[1].value && (
          <Text style={{ color: "white" }}>
            {JSON.stringify(item.request.data, undefined, 4)}
          </Text>
        )}
        {tab === tabs[2].value && (
          <Text style={{ color: "white" }}>
            {JSON.stringify(item.request.headers, undefined, 4)}
          </Text>
        )}
      </View>
    </View>
  );
};

const isError = (a) => a.response?.status < 200 || a.response?.status >= 400;
export default (props) => {
  const [filter, setFilter] = useState("");
  const [errorOnly, setErrorOnly] = useState(false);
  const [filterUrlOnly, setFilterUrlOnly] = useState(true);
  const [expands, setExpands] = useState({});
  const apis = props.apis.filter((a) => !errorOnly || isError(a));

  const hasError = apis.some(isError);

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          paddingLeft: 5,
          alignItems: "center",
          gap: 5,
        }}
      >
        {!!apis.length && !filter && (
          <TouchableOpacity
            style={{ padding: 5, backgroundColor: "white", borderRadius: 5 }}
            onPress={() =>
              Alert.alert("Are you sure", "You want to clear all logs", [
                { text: "Delete", onPress: props.clear, style: "cancel" },
                { text: "Cancel" },
              ])
            }
          >
            <Text style={{ color: "black" }}>
              Clear {props.apis.length} APIs
            </Text>
          </TouchableOpacity>
        )}
        {hasError && !filter && (
          <TouchableOpacity
            style={{ padding: 5 }}
            onPress={() => setErrorOnly((v) => !v)}
          >
            <Text
              style={{
                color: "red",
                textDecorationLine: errorOnly ? "line-through" : undefined,
              }}
            >
              {apis.filter(isError).length} error{apis.filter(isError).length > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        )}
        <View style={{ flexDirection: "row", flex: 1 }}>
          <TextInput
            value={filter}
            placeholder="Filter..."
            clearButtonMode="always"
            placeholderTextColor="grey"
            style={{ paddingHorizontal: 5, color: "white", flex: 1 }}
            onChangeText={(t) => setFilter(t.toLowerCase())}
          />
        </View>
        {!!filter && (
          <TouchableOpacity
            style={{ padding: 5 }}
            onPress={() => setFilterUrlOnly((v) => !v)}
          >
            <Text style={{ color: "#ffffff88" }}>
              {filterUrlOnly ? "by URL" : "by URL & body"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {!filter &&
        !!props.maxNumOfApiToStore &&
        apis.length >= props.maxNumOfApiToStore && (
          <Text style={{ color: "#ffffff88", padding: 10 }}>
            Capped to only latest {props.maxNumOfApiToStore} APIs
          </Text>
        )}
      <SectionList
        contentContainerStyle={{ padding: 5 }}
        keyExtractor={(i) => i.id}
        stickySectionHeadersEnabled
        showsVerticalScrollIndicator
        sections={apis
          .filter((a) =>
            !filter || filterUrlOnly
              ? a.request.url.includes(filter)
              : JSON.stringify(a).toLowerCase().includes(filter)
          )
          .map((data) => ({ data: [data], id: data.id }))}
        renderItem={(i) =>
          expands[i.item.id] ? <Row {...i} /> : <View style={{ height: 20 }} />
        }
        renderSectionHeader={({ section: { data } }) => {
          const item = data[0];
          const hasResponse = !!item.response;

          const duration = item.response?.timestamp
            ? ~~(item.response?.timestamp - item.request.timestamp) / 1000
            : 0;
          const isExpand = expands[item.id];
          return (
            <View style={styles.rowHeader}>
              <Text
                selectable
                style={{
                  flex: 1,
                  color: hasResponse
                    ? item.response.error
                      ? "red"
                      : "white"
                    : "yellow",
                  marginVertical: 10,
                }}
              >
                <Text style={{ opacity: 0.7 }}>
                  {item.request.method +
                    ` (${item.response?.status ?? "no response"})` +
                    " - " +
                    item.request.time +
                    (hasResponse ? " - " + duration + " second(s)" : "") +
                    "\n"}
                </Text>
                {item.request.url.slice(0, MAX_URL_LENGTH)}
                {item.request.url.length > MAX_URL_LENGTH && "......."}
              </Text>
              <View style={{ gap: 4 }}>
                <TouchableOpacity
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
                  <Text style={{ color: "black" }}>
                    {isExpand ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
                {!!Clipboard && (
                  <TouchableOpacity
                    onPress={() => {
                      const content = { ...item };
                      delete content.id;
                      Clipboard.setString(
                        JSON.stringify(content, undefined, 4)
                      );
                    }}
                    style={styles.actionButton}
                  >
                    <Text style={{ color: "black" }}>Copy</Text>
                  </TouchableOpacity>
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
  details: {
    padding: 5,
    backgroundColor: "#171717",
    paddingTop: 10,
    paddingBottom: 40,
  },
  actionButton: { backgroundColor: "white", borderRadius: 5, padding: 4 },
  rowHeader: {
    flexDirection: "row",
    gap: 5,
    backgroundColor: "black",
    padding: 5,
    paddingTop: 20,
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
  selectionTab: {
    borderBottomColor: "white",
    borderBottomWidth: 2,
    flex: 1,
    borderTopEndRadius: 10,
    borderTopStartRadius: 10,
  },
});
