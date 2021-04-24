import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { api } from '../../services/api';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';
import styles from '../../styles/episodes.module.scss';

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  published_at: string;
  publishedAt: string;
  description: string;
  duration: number;
  durationAsString: string;
  file: File;
};

type EpisodeProps = {
  episode: Episode;
};

export default function Episodes({ episode }: EpisodeProps) {
  // const router = useRouter()
  // if(router.isFallback) {
  //   return <p>Carregando...</p>
  // }

  return (
    <div className={styles.episode}>
      <div className={styles.thumbnailContainer}>
        <Link href='/'>
          <button type='button'>
            <img src='/arrow-left.svg' alt='Voltar' />
          </button>
        </Link>
        <Image
          width={700}
          height={168}
          src={episode.thumbnail}
          objectFit='cover'
        />
        <button type='button'>
          <img src='/play.svg' alt='Tocar episódio' />
        </button>
      </div>

      <header className={styles.headerContainer}>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: episode.description }}
      />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await api.get('episodes', {
    params: {
      _limit: 2,
      _sort: 'published_at',
      _order: 'desc'
    }
  });

  const paths = data.map((episode) => {
    return {
      params: {
        slug: episode.id
      }
    };
  });

  return {
    paths,
    fallback: 'blocking'
  };
};

//fallback false: erro 404 se não tiver sido gerado
//fallback true: realiza a requisição pelo cliente das paginas não buildadas
//fallback "blocking": realiza a requisição no server next.js das páginas não buildadas

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { slug } = ctx.params;
  const { data } = await api.get(`/episodes/${slug}`);

  const episode = {
    ...data,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', {
      locale: ptBR
    }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(Number(data.file.duration))
  };

  return {
    props: { episode },
    revalidate: 60 * 60 * 24 //24hours
  };
};
