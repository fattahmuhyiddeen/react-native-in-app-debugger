# react-native-in-app-debugger

This library's main usage is to be used by Non-Technical testers during UAT, SIT or any testing phase.

![ezgif-3-1cb92b8367](https://github.com/fattahmuhyiddeen/react-native-in-app-debugger/assets/24792201/4ffe083a-4807-4a2e-a624-6a81f506439b)



Usage :

```
import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {version} from './package.json';
import InAppDebugger from 'react-native-in-app-debugger';

const variables = {
  url: 'https://staging.sample.com',
};
export default () => (
  <>
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        gap: 10,
      }}>
      <TouchableOpacity
        onPress={() => {
          fetch('https://reactnative.dev/movies.json');
        }}>
        <Text>Success</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          fetch('https://reactnative.dev/wrong-url', {
            headers: {key: 'value'},
          });
        }}>
        <Text>Error</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          fetch('https://swapi.dev/api/planets/?format=wookiee');
        }}>
        <Text>Heavy</Text>
      </TouchableOpacity>
    </View>
    <InAppDebugger version={version} env="staging" variables={variables} labels={['branch: master']} />
  </>
);

```

Call `InAppDebugger` component on top most component, then a floating debugger will appear.


### Installation

You can declare this in your `package.json` without the need to specify version
```
"react-native-in-app-debugger": "latest",
```
because we are committed to ensure that no breaking changes for every released version and all releases will be backward compatible. Therefore, you will enjoy latest version hassle free.

### Properties

All FlatList props should work plus props mentioned below

| Prop | Type | Description | Default | Required |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `env` | string | any value set here will be shown in the floating debugger panel | | Optional |
| `variables` | Plain Old JavaScript Object object {} | Key-Value Plain Old JavaScript Object. Normal use case is to show API URL endpoints, environment variable values or any variables you want to debug on run time | | Optional. If set, the debugger will show a dedicated tab for variables when open in full screen mode |
| `labels` | Array of strings | Array of strings you want to show of the floating debugger pill. For each strings in the array will eb displayed as a single line in the floating debugger pill | | Optional |
| `maxNumOfApiToStore` | integer | Number of APIs to be kept. Too much API might make the whole app lag, therefore need to trade off. Suggested value is 50 | | Optional. If not set, all APIs will be kept forever |
`version` | string | Any string passed here will be shown in debugger's floating panel. | | Optional. If not supplied, version number will taken automatically using React Native Device Info library. But if Device Info library is not installed, then no version will be shown if this prop is not passed.


### Integration with Third Party Library

#### React Native Device Info (https://www.npmjs.com/package/react-native-device-info)

If this library is installed, the floating debugger can automatically show version number, device model, OS version

<img width="129" alt="image" src="https://github.com/fattahmuhyiddeen/react-native-in-app-debugger/assets/24792201/e5c31d91-4915-4270-a968-f3156d5e5a96">


#### React Native Clipboard (https://www.npmjs.com/package/@react-native-clipboard/clipboard)

If this library is installed, when user expand any selected API, there will be a `Copy` button available. Make it very easy for non-techincal tester or user want to copy and paste the API request and response details.

<img width="535" alt="image" src="https://github.com/fattahmuhyiddeen/react-native-in-app-debugger/assets/24792201/d4f58ee3-e553-4cae-91df-ba7e26d8cd70">


#### React Native Async Storage (https://www.npmjs.com/package/@react-native-async-storage/async-storage)

If this library is installed, the blacklist will be persisted