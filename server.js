const net = require('net');
const fs = require('fs');

const public = './public';

const splitando = (data) => {
    const splita = data.toString().split(" ");
    const objeto = {
        path: splita[0],
        path: splita[1]
    }
    return objeto;
}


const server = net.createServer((socket) => {

    socket.on('connect', () => {
        console.log('Nova conexão!');
    });

    console.log(`(${socket.remoteAddress} : ${socket.remotePort}) conecatdo ao servidor`);

    socket.on('data', (data) => {
        let dado = data.toString();
        let splita = splitando(dado);

        if (!fs.existsSync(public + dado.split(" ")[1])) {
            socket.write("HTTP/1.1 404 NOT FOUD\r\n\r\n");
            socket.end();
        } else {
            fs.readFile(public + splita.path, (err, data) => {
                if (splita.path == "/") {
                    socket.write('HTTP/1.1 200 OK\r\n\r\n')
                    socket.write()
                    socket.end();
                } else if (err) {
                    socket.write("HTTP/1.1 404 NOT FOUD\r\n\\r\n")
                    socket.write(err);
                } else {
                    socket.write('HTTP/1.1 200 ok\r\n\r\n');
                }
                socket.end();
            })
        }
    });
    socket.on('end', () => {
        console.log(`(${socket.remoteAddress} : ${socket.remotePort}) desconectou`)
    })
});

const port = 8124;
const host = "127.0.0.1";

server.listen(port, () => {
    console.log(`Servidor aberto na porta ${port}`);
});  