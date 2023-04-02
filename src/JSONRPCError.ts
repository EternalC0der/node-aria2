import { JSONRPCError as IJSONRPCError } from './types'

export default class JSONRPCError extends Error {
    code: number
    data: any
    constructor({ message, code, data }: IJSONRPCError) {
        super(message)
        this.code = code
        if (data) this.data = data
        this.name = this.constructor.name
    }
}
