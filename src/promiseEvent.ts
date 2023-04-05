export default function promiseEvent(target: any, event: string): Promise<any> {
    return new Promise((resolve, reject) => {
        function cleanup() {
            target.removeListener(event, onEvent)
            target.removeListener('error', onError)
        }
        function onEvent(data: any) {
            resolve(data)
            cleanup()
        }
        function onError(err: any) {
            reject(err)
            cleanup()
        }
        target.addListener(event, onEvent)
        target.addListener('error', onError)
    })
}
