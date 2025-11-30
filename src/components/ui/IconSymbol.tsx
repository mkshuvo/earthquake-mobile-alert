// This is a mapping of the SF Symbols to Material Community Icons names.
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { StyleProp, ViewStyle, TextStyle } from 'react-native';
import React from 'react';

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle | TextStyle>;
}) {
  // Map SF Symbols (used in template) to MaterialCommunityIcons
  let iconName = 'help-circle';
  
  if (name === 'house.fill') iconName = 'home';
  else if (name === 'globe') iconName = 'earth';
  else if (name === 'gear') iconName = 'cog';
  else if (name === 'chevron.left.forwardslash.chevron.right') iconName = 'code-tags';
  else if (name === 'paperplane.fill') iconName = 'send';

  return <MaterialCommunityIcons name={iconName} size={size} color={color} style={style} />;
}
