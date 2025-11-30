import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Pressable } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { ref, ...otherProps } = props;
  return (
    <Pressable
      {...otherProps}
      onPressIn={(ev) => {
        // Add haptic feedback logic here if needed
        props.onPressIn?.(ev);
      }}
    />
  );
}
