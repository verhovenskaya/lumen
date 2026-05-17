import {
  HiOutlineRocketLaunch,
} from 'react-icons/hi2';

import {
  MdOutlineSatelliteAlt,
} from 'react-icons/md';

import {
  RiChat3Line,
} from 'react-icons/ri';

import {
  IoSettingsOutline,
} from 'react-icons/io5';

import {
  GiTargetArrows,
} from 'react-icons/gi';

export const MENU_ITEMS = [
  {
    key: 'Missions',
    label: 'Миссии',
    icon: GiTargetArrows,
  },
  {
    key: 'Spacecraft',
    label: 'Космические аппараты',
    icon: HiOutlineRocketLaunch,
  },
  {
    key: 'Satellites',
    label: 'Спутники',
    icon: MdOutlineSatelliteAlt,
  },
  {
    key: 'Chat',
    label: 'Чат',
    icon: RiChat3Line,
  },
  {
    key: 'Settings',
    label: 'Настройки',
    icon: IoSettingsOutline,
  },
];