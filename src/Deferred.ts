export default class Deferred {
    promise: Promise<any>
    resolve!: (value: any) => void
    reject!: (reason?: any) => void
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve
            this.reject = reject
        })
    }
}
