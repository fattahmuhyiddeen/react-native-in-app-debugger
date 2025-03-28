import React from 'react';
import { Linking, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default ({deeplinkPrefix, onClose}) => {
  const [text, setText] = React.useState('');
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', margin: 10 }}>
      <Text style={{ color: 'white' }}>{deeplinkPrefix}</Text>
      <TextInput
        value={text}
        autoCapitalize='none'
        autoCorrect={false}
        autoComplete='off'
        onChangeText={setText}
        style={{ flex: 1, backgroundColor: '#555', marginRight: 10, padding: 3, borderRadius: 3 }}
      />
      <TouchableOpacity
        style={{ padding: 7, borderRadius: 4, backgroundColor: 'white' }}
        onPress={() => {
          onClose();
          Linking.openURL(deeplinkPrefix + text);
        }}
      >
        <Text style={{ color: 'black', fontSize: 9 }}>Go</Text>
      </TouchableOpacity>
    </View>
  );
};
