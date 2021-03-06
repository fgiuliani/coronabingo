import { ParsedUrlQuery } from 'querystring'
import React, { createContext, ReactNode, useEffect, useState } from 'react'
import { FirebaseContextData, Player } from '~/interfaces'
import { roomsRef } from '~/utils/firebase'

const FirebaseContext = createContext<FirebaseContextData>({
  players: [],
  setPlayers: () => null,
  setCurrentPlayer: () => null,
})

interface Props {
  children: ReactNode
  routerQuery: ParsedUrlQuery
}

const FirebaseProvider = ({ children, routerQuery }: Props) => {
  const roomId = routerQuery.roomId?.toString()
  const playerId = routerQuery.playerId?.toString()
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<Player>()

  const sortAndSet = (array: Player[]) =>
    setPlayers(array.sort((a, b) => a.name.localeCompare(b.name)))

  useEffect(() => {
    if (!roomId) return
    return playerId
      ? roomsRef.doc(`${roomId}/players/${playerId}`).onSnapshot(p =>
          setCurrentPlayer({
            id: p.id,
            exists: p.exists,
            ref: p.ref,
            ...(p.data() as Player),
          }),
        )
      : roomsRef
          .doc(roomId)
          .collection('players')
          .onSnapshot(snapshot => {
            sortAndSet(
              snapshot.docs.map(p => ({
                id: p.id,
                exists: p.exists,
                ref: p.ref,
                ...(p.data() as Player),
              })),
            )
          })
  }, [roomId, playerId])

  return (
    <FirebaseContext.Provider
      value={{
        currentPlayer,
        setCurrentPlayer,
        players,
        setPlayers: sortAndSet,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  )
}

export { FirebaseContext, FirebaseProvider }
