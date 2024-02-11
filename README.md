# react-native-in-app-debugger

summary


Usage :

```
import React from 'react';

```


### Properties

All FlatList props should work plus props mentioned below

| Prop                          | Type                                                                                                 | Description                                                                                                                                                                                                                                                                                                               | Default                                                             | Required                                                                |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `env`                  | string                                                                                              | any value set here will be shown in the floating debugger panel                                                                                                                                                                                                                                                     |                                                                 | Optional                                                                |
| `maxNumOfApiToStore`                  | integer                                                                                              | Number of APIs to be kept. Too much API might make the whole app lag, therefore need to trade off. Suggested value is 50                                                                                                                                                                                                                                                     |                                                                 | Optional. If not set, all APIs will be kept forever                                                                |

