import React, { useState } from 'react';
import { Text, FlatList, TextInput } from 'react-native';

export default ({ envs }) => {
  const [filter, setFilter] = useState('');

  return (
    <>
      <TextInput
        value={filter}
        placeholder='Filter...'
        placeholderTextColor='grey'
        style={{ paddingHorizontal: 5, color: 'white' }}
        onChangeText={(t) => setFilter(t.toLowerCase())}
      />
      <FlatList
        contentContainerStyle={{ padding: 5, paddingBottom: 20 }}
        data={Object.keys(envs).filter(
          (k) => !filter || envs[k].toLowerCase().includes(filter) || k.toLowerCase().includes(filter),
        )}
        keyExtractor={(i) => i}
        renderItem={({ item }) => (
          <Text selectable style={{ color: 'white', marginVertical: 10 }}>
            {item + ' : ' + envs[item]}
          </Text>
        )}
      />
    </>
  );
};
