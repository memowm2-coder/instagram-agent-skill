import React from 'react';
import {Composition} from 'remotion';
import {Episode, SafeZones} from './Episode';
import {EPISODE_SECONDS, FPS, PREVIEW_SECONDS} from './scenes';

export const Root: React.FC = () => (
  <>
    <Composition id="ScrubsPreview" component={Episode} durationInFrames={PREVIEW_SECONDS * FPS} fps={FPS} width={1920} height={1080} />
    <Composition id="ScrubsFull" component={Episode} durationInFrames={EPISODE_SECONDS * FPS} fps={FPS} width={1920} height={1080} />
    <Composition id="SafeZones" component={SafeZones} durationInFrames={1} fps={FPS} width={1920} height={1080} />
  </>
);
