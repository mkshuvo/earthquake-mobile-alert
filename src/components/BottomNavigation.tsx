import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export type TabName = 'map' | 'recent' | 'safety' | 'mylog' | 'help' | 'more';

interface BottomNavigationProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: { name: TabName; label: string; icon: string }[] = [
    { name: 'map', label: 'Map', icon: 'map' },
    { name: 'recent', label: 'Recent', icon: 'list' },
    { name: 'safety', label: 'Safety', icon: 'check-circle' },
    { name: 'mylog', label: 'My Log', icon: 'file-document' },
    { name: 'help', label: 'Help', icon: 'help-circle' },
    { name: 'more', label: 'More', icon: 'dots-horizontal' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={styles.tab}
          onPress={() => onTabChange(tab.name)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={tab.icon}
            size={24}
            color={activeTab === tab.name ? '#17a2b8' : '#999'}
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color: activeTab === tab.name ? '#17a2b8' : '#999',
              },
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 8,
    paddingTop: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
});
