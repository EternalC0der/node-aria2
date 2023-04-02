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
