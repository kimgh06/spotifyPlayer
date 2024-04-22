import { AddbuttonIndex } from "@/app/recoilStates";
import { useState } from "react";
import { useRecoilState } from "recoil";

export function MenuComponent({ albumId, title }) {
  const [mode, setMode] = useState('');
  const [_, setPopup] = useRecoilState(AddbuttonIndex);
  return <>
    {mode === '' && <S.MenuComponent>
      <div className='button' onClick={e => {
        navigator.clipboard.writeText(`https://freetify.vercel.app/album/${albumId}#${title}`)
        alert(title + ' Copied.')
        setPopup('')
      }}>Copy the Url!</div>
      <div className='button' onClick={e => setMode('playlist')}>Setting Playlists</div>
    </S.MenuComponent>}
    {mode === 'playlist' && <ShowPlaylists />}
  </>
}
