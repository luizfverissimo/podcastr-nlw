import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Slider from 'rc-slider';

import 'rc-slider/assets/index.css';

import { usePlayer } from '../../contexts/PlayerContext';

import styles from './styles.module.scss';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player() {
  const [progress, setProgress] = useState(0);

  const {
    episodeList,
    currentEpisodeIndex,
    isPlaying,
    isLooping,
    isShuffling,
    togglePlay,
    setPlayingState,
    playNext,
    playPrevious,
    toggleLoop,
    toggleShuffle,
    clearPlayerState,
    hasNext,
    hasPrevious
  } = usePlayer();

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    if (isPlaying) {
      audioRef.current.play();
    }
    if (!isPlaying) {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const episode = episodeList[currentEpisodeIndex];

  function setupProgressListener() {
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener('timeupdate', () => {
      setProgress(Math.floor(audioRef.current.currentTime));
    });
  }

  function handleSeek(amount: number) {
    audioRef.current.currentTime = amount;
    setProgress(amount);
  }

  function handleEpisodeEnded() {
    if(hasNext) {
      playNext()
    } else {
      clearPlayerState()
    }
  }

  return (
    <div className={styles.container}>
      <header>
        <img src='/playing.svg' alt='Tocando agora' />
        <strong>Tocando agora</strong>
      </header>

      {episode ? (
        <div className={styles.currentEpisode}>
          <Image
            width={592}
            height={592}
            src={episode.thumbnail}
            objectFit='cover'
          />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      )}

      <footer className={!episode ? styles.empty : ''}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span>
          <div className={styles.slider}>
            {episode ? (
              <Slider
                max={episode.duration}
                value={progress}
                onChange={handleSeek}
                trackStyle={{ backgroundColor: '#04d361' }}
                railStyle={{ backgroundColor: '#9f75ff' }}
                handleStyle={{ borderColor: '#04d361' }}
              />
            ) : (
              <div className={styles.emptySlider} />
            )}
          </div>
          <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
        </div>

        {episode && (
          <audio
            ref={audioRef}
            src={episode.file.url}
            autoPlay
            loop={isLooping}
            onPlay={() => setPlayingState(true)}
            onPause={() => {
              setPlayingState(false);
            }}
            onEnded={handleEpisodeEnded}
            onLoadedMetadata={setupProgressListener}
          ></audio>
        )}

        <div className={styles.buttons}>
          <button
            type='button'
            className={isShuffling ? styles.isActive : ''}
            disabled={!episode || episodeList.length === 1}
            onClick={toggleShuffle}
          >
            <img src='/shuffle.svg' alt='Embaralhar' />
          </button>
          <button
            type='button'
            disabled={!episode || !hasPrevious}
            onClick={playPrevious}
          >
            <img src='/play-previous.svg' alt='Tocar anterior' />
          </button>
          <button
            type='button'
            className={styles.playButton}
            disabled={!episode}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <img src='/pause.svg' alt='Pausar' />
            ) : (
              <img src='/play.svg' alt='Tocar' />
            )}
          </button>
          <button
            type='button'
            disabled={!episode || !hasNext}
            onClick={playNext}
          >
            <img src='/play-next.svg' alt='Tocar próxima' />
          </button>
          <button
            type='button'
            className={isLooping ? styles.isActive : ''}
            disabled={!episode}
            onClick={toggleLoop}
          >
            <img src='/repeat.svg' alt='Repetir' />
          </button>
        </div>
      </footer>
    </div>
  );
}
