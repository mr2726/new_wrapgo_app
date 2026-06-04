import {View, StyleSheet, Pressable, Animated} from 'react-native';
import {Image} from 'expo-image';
import React from 'react';

const MENU_WIDTH = 320;
const MENU_PADDING_HORIZONTAL = 8;
const MENU_ITEM_SIZE = 52;

const ICON_ASSETS = {
  home: require('./imgs/Home.svg'),
  settings: require('./imgs/Contract.svg'),
  contract: require('./imgs/Contract.svg'),
  info: require('./imgs/Wallet.svg'),
  wallet: require('./imgs/Wallet.svg'),
  user: require('./imgs/Profile.svg'),
  profile: require('./imgs/Profile.svg'),
};

export function Menu({items, onSelect}) {
  const getIconSource = (icon) => {
    const normalized = String(icon).toLowerCase();
    return ICON_ASSETS[normalized] || ICON_ASSETS.home;
  };

  const [activeIndex, setActiveIndex] = React.useState(0);
  const animatedOffset = React.useRef(new Animated.Value(0)).current;

  const step = React.useMemo(() => {
    const total = Array.isArray(items) ? items.length : 0;
    if (total <= 1) {
      return 0;
    }

    return (MENU_WIDTH - MENU_PADDING_HORIZONTAL * 2 - MENU_ITEM_SIZE) / (total - 1);
  }, [items]);

  React.useEffect(() => {
    Animated.spring(animatedOffset, {
      toValue: activeIndex * step,
      useNativeDriver: true,
      speed: 16,
      bounciness: 6,
    }).start();
  }, [activeIndex, step, animatedOffset]);

  const handlePress = (item, index) => {
    setActiveIndex(index);
    onSelect?.(item);
  };

  return (
    <View style={styles.menu}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.activeBubble,
          {
            transform: [{translateX: animatedOffset}],
          },
        ]}
      />
      {items.map((item, index) => {
        const iconSource = getIconSource(item.img);
        const isActive = index === activeIndex;
        return (
          <Pressable key={index} style={styles.menuItem} onPress={() => handlePress(item, index)}>
            <Image source={iconSource} style={styles.icon} contentFit="contain" tintColor={isActive ? '#000000' : '#626262'} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    width: 320,
    height: 64,
    backgroundColor: '#151515',
    borderRadius: 32,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  activeBubble: {
    position: 'absolute',
    left: MENU_PADDING_HORIZONTAL,
    top: 6,
    width: MENU_ITEM_SIZE,
    height: MENU_ITEM_SIZE,
    borderRadius: MENU_ITEM_SIZE / 2,
    backgroundColor: '#24FF3D',
  },
  menuItem: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  icon: {
    width: 24,
    height: 24,
  },
});