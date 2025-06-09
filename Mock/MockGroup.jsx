import React, { useState } from 'react';
import { StyleSheet, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import Text from '../Text';
import Highlight from '../Highlight';

export const MAX_URL_LENGTH = 100;

export default (p) => {
  const [expand, setExpand] = useState(false);
  return (
    <View>
      <TouchableHighlight underlayColor='#ffffff44' onPress={() => setExpand((v) => !v)}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 5,
            flex: 1,
          }}
        >
          <Text selectable style={{ color: 'white', marginVertical: 10 }}>
            <Highlight
              text={p.item.title.slice(0, MAX_URL_LENGTH) + (p.item.title.length > MAX_URL_LENGTH ? '.....' : '')}
              filter={p.filter}
            />
          </Text>
          <View>
            <View style={{ padding: 5, backgroundColor: '#777', borderRadius: 8 }}>
              <Text>{p.item.data.length}</Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
      {expand &&
        p.item.data.map((d) => (
          <View style={{padding: 5}} key={d.id}>
            <Text style={{ color: '#555', fontSize: 8 }}>{d.id}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: 'grey' }}>{d.request.datetime}</Text>
              <View style={{ flexDirection: 'row', gap: 5 }}>
                <TouchableOpacity style={styles.actionButton} onPress={() => p.deleteMock(d.id)}>
                  <Text style={{ color: 'black', fontSize: 10 }}>delete</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => p.setMockDetails(d)}>
                  <Text style={{ color: 'black', fontSize: 10 }}>edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
