"use client"
import Navi from "@/components/nav";
import PlaylistAtom from "@/components/playlistAtom";
import axios from "axios";
import * as S from './style';
import { useEffect, useState } from "react";
import { RecoilRoot, useRecoilState } from "recoil";
import { AccessToken } from "./recoilStates";
import { Analytics } from "@vercel/analytics/react"
import Link from "next/link";

export function Home() {
  return <RecoilRoot>
    <InnerComponent />
    <Analytics />
  </RecoilRoot>;
}

function InnerComponent() {
  const [tracks, setTracks] = useState([]);
  const [access, setAccess] = useRecoilState(AccessToken);
  const [view, setView] = useState(true);
  const noticeDay = 20240821;
  const getTokens = async e => {
    const queries = new URLSearchParams(location.search);
    await axios.post(`/api/getTokens`, {
      code: queries.get('code'),
      state: queries.get('state')
    }).then(e => {
      const info = e.data;
      if (!info?.error) {
        localStorage.setItem('access', info.access_token);
        localStorage.setItem('refresh', info.refresh_token);
        localStorage.setItem('expire', new Date().getTime() + info.expires_in * 1000);
        localStorage.setItem('scopes', info.scope);
      }
    }).catch(e => {
      console.log(e);
    });
  }
  const getTrackinfos = async ids => {
    if (ids) {
      return await axios.get(`https://api.spotify.com/v1/tracks?ids=${ids}`, { headers: { Authorization: `Bearer ${access}` } }).then(e => {
        return e.data.tracks
      }).catch(e => {
        console.log(e);
      });
    }
  }
  const GettingInfos = async e => {
    let ids = ["3H4ZrsDezaN37zplSpXUWd",
      "3LDNcikQd7Zui9gJCISTtR",
      "7fhiGdj0nn0ZCmIAocG8G0",
      "7F02x6EKYIQV3VcTaTm7oN",
      "4rDbp1vnvEhieiccprPMdI",
      "5tdKaKLnC4SgtDZ6RlWeal",
      "5T7ywazdGIydr6JCW6t02j",
      "4Zc7TCHzuNwL0AFBlyLdyr",
      "7G7tgVYORlDuVprcYHuFJh",
      "0lllvs6dDxZcZoc85ReNYV",
      "5luOvrlnzfvJQdQjrScVj4",
      "2RWFncSWZEhSRRifqiDNVV",
      "58XWGx7KNNkKneHdprcprX",
      "3NYCaxkggl0Hh8vQptSUvV",
      "3IOQZRcEkplCXg6LofKqE9",
      "4HiC3ulkTgbEcYYsSuR6PO",
      "6olS0TmHmsGr0hXtcBsiVM",
      "5qFxuUIAwJlzO60vqOiL7y",
      "57P8gH8rjt4OqEoqzut1bL",
      "5YXvG4PL4Wisyx2ScUxVFF",
      "0C80GCp0mMuBzLf3EAXqxv",
      "3Fzlg5r1IjhLk2qRw667od",
      "39lSeqnyjZJejRuaREfyLL"];
    if (localStorage.getItem('recommendation') !== null) {
      ids = localStorage.getItem('recommendation').split(',');
    }
    else if (localStorage.getItem('recent_track_list') !== null && localStorage.getItem('recent_artists_list') !== null) {
      const recentTrack = localStorage.getItem('recent_track_list').split(',').slice(-3);
      const recentArtists = localStorage.getItem('recent_artists_list').split(',').slice(-3);
      ids = await axios.get(`https://api.spotify.com/v1/recommendations?seed_tracks=${recentTrack}&seed_artists=${recentArtists}`, { headers: { Authorization: `Bearer ${access}` } }).then(e => {
        const track = e.data.tracks;
        let list = [];
        track.forEach(e => {
          list.push(e.id)
        })
        localStorage.setItem("recommendation", [list]);
        console.log(list)
        return list
      });
    }
    let tr = await getTrackinfos(ids);
    if (!tr) {
      return;
    }
    setTracks(tr);
    let TrackList = [];
    tr?.forEach(items => {
      if (TrackList.indexOf(items.id) === -1) {
        TrackList.push(items.id);
      }
    });
    localStorage.setItem('TrackList', `${TrackList}`);
  }
  useEffect(e => {
    const queries = new URLSearchParams(location.search);
    document.title = 'Recommendations';
    setView(localStorage.getItem(noticeDay) !== 'false')
    if (queries.size !== 0) {
      getTokens();
    } else {
      if (access) {
        GettingInfos();
      }
    }
  }, [access]);
  return <>
    <Navi />
    <S.App>
      {view && <S.Notice>
        <h1><button onClick={e => localStorage.setItem(noticeDay, 'false')}>X</button>Notice</h1>
        <p>Now you can use music player.</p>
        I fixed some bugs and added some features. <br />
      </S.Notice>}
      <Link prefetch className="searchButton" href={`/search`}>
        <S.searchButton placeholder="Search" />
      </Link>
      <h1>Recommendations</h1>
      {tracks?.length !== 0 && tracks?.map((i, n) => <PlaylistAtom index={n} preview={i?.preview_url} album={i?.album} playingtime={i?.duration_ms} key={n} img={i?.album.images[2].url} type={i?.type}
        id={i?.id} title={i?.name} artist={i?.artists} artistId={i?.artists[0].id} isInPlay={e => {
          let list = [];
          list = JSON.parse(localStorage.getItem('list'));
          if (list === null) {
            list = [];
          }
          return list.find(a => a === i?.id)
        }} />)}
      <S.PaddingBox />
    </S.App>
  </>;
}