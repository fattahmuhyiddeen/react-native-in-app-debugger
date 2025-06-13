import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Text from "../Text";
import X from "../X";

const removeId = (key, value) => (key === "id" ? undefined : value);
export default (p) => {
  const [tab, setTab] = useState("response");
  const [tmpResBody, setTmpResBody] = useState("");
  const [tmpResStatus, setTmpResStatus] = useState("");
  const [tmpMockDetails, setTmpMockDetails] = useState({});

  const save = (cb) => {
    if (tab === "response") {
      try {
        if (!tmpResStatus)
          return Alert.alert("Sorry", "Status code is required");

        const tmp = JSON.parse(tmpMockDetails);
        tmp.response.data = JSON.parse(tmpResBody);
        tmp.response.status = parseInt(tmpResStatus, 10);
        p.setMockDetails(tmp);

        p.setMocks((v) => {
          const index = v.findIndex((m) => m.id === p.mockDetails.id);
          // p.setMockDetails(null);
          if (!~index) {
            const id = Date.now().toString(36) + Math.random().toString(36);
            p.setMockDetails((md) => ({ ...md, id }));
            const hasOtherActivated = v.some(
              (s) =>
                s.active &&
                s.request.url === tmp.request.url &&
                s.request.method === tmp.request.method
            );
            return [...v, { ...tmp, id, active: !hasOtherActivated }];
          }
          v[index] = { ...v[index], ...tmp };
          p.setMockDetails(v[index]);
          return v;
        });
        // p.setMocks(v => {
        //   const tmp = [...v];
        //   for(let i = 0; i < tmp.length; i++) {
        //     if (tmp[i].id === p.mockDetails.id) {
        //       tmp[i] = { ...tmp[i], ...tmp };
        //       break;
        //     }
        //   }
        //   // v.forEach(m => m.id === p.mockDetails.id && (m.response = tmp.response));
        //   return tmp;
        // })
        cb?.();
      } catch (e) {
        return Alert.alert("Sorry", "Please fix the response body JSON");
      }
    } else if (tab === "json") {
      cb?.();
    } else if (tab === "request") {
      cb?.();
    }
  };
  const hasResponse = !!p.mockDetails?.response;

  const reset = () => {
    if (!p.mockDetails) return;
    setTmpMockDetails(JSON.stringify(p.mockDetails, removeId, 4));
    if (hasResponse) {
      setTmpResBody(JSON.stringify(p.mockDetails.response.data, removeId, 4));
      setTmpResStatus(p.mockDetails.response.status + "" || "");
    } else {
      setTmpResBody("");
      setTmpResStatus("");
    }
  };
  useEffect(reset, [p.mockDetails]);
  // const [canReset, setCanReset] = useState(false);

  const parse = (data) => {
    try {
      return JSON.parse(data);
    } catch (e) {
      // Alert.alert('Error', 'Invalid JSON');
      return {};
    }
  };

  // console.log('xxxxx mock details', JSON.stringify(p.mockDetails, removeId)?.replace(/\s+/g, ""))
  // console.log('xxxxx tmpMockDetails', tmpMockDetails?.replace?.(/\s+/g, ""))

  // useEffect(() => {
  //   try {
  //     setCanReset(JSON.stringify(p.mockDetails, removeId)?.replace(/\s+/g, "") != tmpMockDetails?.replace?.(/\s+/g, ""));
  //   } catch (e) {
  //     setCanReset(true);
  //   }
  // }, [p.mockDetails, tmpMockDetails]);
  if (!p.mockDetails) return null;
  // const canReset = JSON.stringify(p.mockDetails, removeId)?.replace(/\s+/g, '') !== tmpMockDetails?.replace?.(/\s+/g, '');
  const canReset =
    !hasResponse ||
    tmpResStatus != p.mockDetails.response.status ||
    JSON.stringify(p.mockDetails.response.data)?.replace(/\s+/g, "") !==
      tmpResBody?.replace?.(/\s+/g, "");
  const isnew = !p.mocks.some((m) => m.id === p.mockDetails.id);

  // console.log('xxxxx response', JSON.stringify(p.mockDetails.response.data)?.replace(/\s+/g, ''));
  // console.log('xxxxx tmpResBody', tmpResBody?.replace?.(/\s+/g, ''));

  return (
    <View style={styles.container}>
      {!isnew && <Text style={{ opacity: 0.3 }}>{p.mockDetails.id}</Text>}
      <View style={{ flexDirection: "row" }}>
        <Text
          style={{ flex: 1 }}
        >{`(${p.mockDetails.request.method}) ${p.mockDetails.request.url}`}</Text>
        <TouchableOpacity onPress={() => p.setMockDetails(null)}>
          <X size={25} />
        </TouchableOpacity>
      </View>
      <View style={styles.headerContainer}>
        {["request", "response", "json"].map((item) => {
          const isSelected = item === tab;
          return (
            <TouchableOpacity
              style={{
                backgroundColor: isSelected ? "white" : "black",
                padding: 3,
                borderRadius: 5,
              }}
              onPress={() => {
                // save(() => setTab(item));
                setTab(item);
              }}
            >
              <Text
                style={{
                  textTransform: "uppercase",
                  color: isSelected ? "black" : "white",
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {tab === "response" && (
        <View style={{ gap: 3, padding: 10 }}>
          <View style={{ flexDirection: "row", gap: 5 }}>
            <Text>Status</Text>
            <TextInput
              style={{ ...styles.textField, width: 50 }}
              inputMode="numeric"
              onChangeText={(t) => {
                setTmpResStatus(t);
                // try {
                //   const newData = JSON.parse(tmpMockDetails);
                //   newData.response.status = parseInt(t, 10);
                //   setTmpMockDetails(JSON.stringify(newData, removeId, 4));
                // } catch (e) {
                //   Alert.alert('Error', 'Invalid JSON');
                // }
              }}
              value={tmpResStatus}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 5 }}>
            <Text>Body</Text>
            <TextInput
              style={{
                ...styles.textField,
                height: 250,
                flex: 1,
              }}
              multiline
              onChangeText={setTmpResBody}
              value={tmpResBody}
            />
          </View>
        </View>
      )}
      {tab !== "response" && (
        <Text style={{ marginTop: 30, textAlign: "center" }}>
          To be developed later
        </Text>
      )}
      {/* {tab === 'json' && (
        <TextInput onChangeText={setTmpMockDetails} value={tmpMockDetails} style={{ height: '40%' }} multiline />
      )} */}
      {tab === "response" && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 10,
          }}
        >
          {!isnew && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                p.deleteMock(p.mockDetails.id);
                p.setMockDetails(null);
              }}
            >
              <Text style={{ fontSize: 15 }}>Delete</Text>
            </TouchableOpacity>
          )}
          {canReset && (
            <TouchableOpacity style={styles.actionButton} onPress={reset}>
              <Text style={{ fontSize: 15 }}>Reset</Text>
            </TouchableOpacity>
          )}
          {(canReset || isnew) && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                // try {
                //   const tmp = JSON.parse(tmpMockDetails);
                //   if (!tmp.request) {
                //     Alert.alert('Error', 'Invalid JSON');
                //     return;
                //   }
                //   p.setMocks((v) => {
                //     const index = v.findIndex((m) => m.id === p.mockDetails.id);
                //     p.setMockDetails(null);
                //     if (!~index) return [...v, { ...tmp, id: Date.now().toString(36) + Math.random().toString(36) }];
                //     v[index] = { ...tmp, id: p.mockDetails.id };
                //     return v;
                //   });
                // } catch (e) {
                //   Alert.alert('Error', 'Invalid JSON');
                // }
                save();
              }}
            >
              <Text style={{ fontSize: 15 }}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    position: "absolute",
    zIndex: 1000,
    backgroundColor: "grey",
    width: "100%",
    height: "100%",
    paddingTop: 50,
  },
  headerContainer: {
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "black",
    borderRadius: 5,
    padding: 5,
  },
  actionButton: {
    backgroundColor: "white",
    borderRadius: 5,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  textField: {
    backgroundColor: "#ccc",
    width: 50,
    padding: 2,
    borderRadius: 5,
  },
});
