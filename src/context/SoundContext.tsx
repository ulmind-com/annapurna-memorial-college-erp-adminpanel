import React, { createContext, useContext, useState, useEffect } from 'react';
import { soundFx } from '../utils/audio';

interface SoundContextType {
  soundEnabled: boolean;
  toggleSound: () => void;
  playClick: () => void;
  playTab: () => void;
  playHaptic: () => void;
  playSuccess: () => void;
  playApprove: () => void;
  playAlert: () => void;
  playPop: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundFx.isEnabled());

  useEffect(() => {
    const unsubscribe = soundFx.subscribe((enabled) => {
      setSoundEnabled(enabled);
    });
    return unsubscribe;
  }, []);

  const toggleSound = () => {
    soundFx.toggle();
  };

  const playClick = () => soundFx.play('click');
  const playTab = () => soundFx.play('tab');
  const playHaptic = () => soundFx.play('haptic');
  const playSuccess = () => soundFx.play('success');
  const playApprove = () => soundFx.play('approve');
  const playAlert = () => soundFx.play('alert');
  const playPop = () => soundFx.play('pop');

  return (
    <SoundContext.Provider
      value={{
        soundEnabled,
        toggleSound,
        playClick,
        playTab,
        playHaptic,
        playSuccess,
        playApprove,
        playAlert,
        playPop,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = (): SoundContextType => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
