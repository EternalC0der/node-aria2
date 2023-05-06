export type Options = {
    secure: boolean
    host: string
    port: number
    secret: string
    path: string
}

export type JSONRPCError = {
    code: number
    message: string
    data: any
}

export type Message = {
    method: string
    'json-rpc': string
    id: number
    params: any[]
    error: JSONRPCError
    result: any
}

export type aria2Methods =
    | 'addUri'
    | 'addTorrent'
    | 'addMetalink'
    | 'remove'
    | 'forceRemove'
    | 'pause'
    | 'pauseAll'
    | 'forcePause'
    | 'forcePauseAll'
    | 'unpause'
    | 'unpauseAll'
    | 'tellStatus'
    | 'getUris'
    | 'getFiles'
    | 'getPeers'
    | 'getServers'
    | 'tellActive'
    | 'tellWaiting'
    | 'tellStopped'
    | 'changePosition'
    | 'changeUri'
    | 'getOption'
    | 'changeOption'
    | 'getGlobalOption'
    | 'changeGlobalOption'
    | 'getGlobalStat'
    | 'purgeDownloadResult'
    | 'removeDownloadResult'
    | 'getVersion'
    | 'getSessionInfo'
    | 'shutdown'
    | 'forceShutdown'
    | 'saveSession'
    | 'system.multicall'
    | 'system.listMethods'
    | 'system.listNotifications'
