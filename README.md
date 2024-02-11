# react-native-in-app-debugger

This library's main usage is be used by Non-Technical tester during UAT or SIT or any testing phase.


Usage :

```
import React from 'react';

```


### Properties

All FlatList props should work plus props mentioned below

| Prop | Type | Description | Default | Required |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `env` | string | any value set here will be shown in the floating debugger panel | | Optional |
| `variables` | Plain Old JavaScript Object object {} | Key-Value Plain Old JavaScript Object. Normal use case is to show API URL endpoints, environment variable values or any variables you want to debug on run time | | Optional. If set, the debugger will show a dedicated tab for variables when open in full screen mode |
| `maxNumOfApiToStore` | integer | Number of APIs to be kept. Too much API might make the whole app lag, therefore need to trade off. Suggested value is 50 | | Optional. If not set, all APIs will be kept forever |
`version` | string | Any string passed here will be shown in debugger's floating panel. | | Optional. If not supplied, version number will taken automatically using React Native Device Info library. But if Device Info library is not installed, then no version will be shown if this prop is not passed.


### Integration with Third Party Library

#### React Native Device Info (https://www.npmjs.com/package/react-native-device-info)

If this library is installed, the floating debugger can automatically show version number, device model, OS version

#### React Native Clipboard (https://www.npmjs.com/package/@react-native-clipboard/clipboard)

If this library is installed, when user expand any selected API, there will be a `Copy` button available. Make it very easy for non-techincal tester or user want to copy and paste the API request and response details.