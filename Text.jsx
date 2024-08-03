import React from 'react';
import { Text, Platform } from 'react-native';

export default ({ style = {}, ...props }) => <Text selectable {...props} style={[{ fontFamily: Platform.OS === 'android' ? 'Roboto' : 'San Francisco' }, style]} />;
