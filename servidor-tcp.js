const net = require("net");
const fs = require("fs");

const arquivos = "./public/";

const splitando = (splitLine) => {
    var split = splitLine.toString().split(" ");
    let objeto = {
        method: split[0],
        path: split[1],
    };

    return objeto;
};

const server = net.createServer((socket) => {
    console.log(
        `(${socket.remoteAddress} : ${socket.remotePort}) conectou `
    );

    socket.on("data", (data) => {
        var dado = data.toString();
        var objeto = splitando(dado);

        console.log(dado);
        console.log(splitando(dado));

        if (!fs.existsSync(arquivos + dado.split(" ")[1])) {
            // socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
            socket.write( `POST / HTTP/1.1 200 ok\r\nHost: localhost:${port}\r\n`);
            socket.end();
        } else {
            console.log(dado.split(" ")[1]);
            fs.readFile(arquivos + objeto.path, (err, data) => {
                if(objeto.path == "/"){ 
                    let filesLink="<ul>";
                    socket.write('HTTP/ 200 OK\r\n\r\n');
                    let filesList = fs.readdirSync("./public");
                    filesList.forEach(el => {
                        if(fs.statSync("./public/"+ el).isFile()){
                            filesLink+=`<br/><li><a href='${el}'>
                                ${el}
                            </a></li>` ;       
                        }
                    });
                     
                    filesLink+="</ul>";
                  
                    socket.write("<h1>Lista de arquivos:</h1> " + filesLink);
                    socket.end()
                } else if (err) {
                    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
                    console.log(err);
                } else {
                    socket.write("HTTP/1.1 200 OK\r\n\r\n");
                    socket.write(data);
                }
                socket.end();
            });
        }
    });

    socket.on("end", () => {
        console.log(
            `=> (${socket.remoteAddress} : ${socket.remotePort}) desconectou`
        );
    });
});

const port = 4002;
const host = "127.0.0.1";

server.listen(port, host, () => {
    console.log(`Servidor iniciado em ${host}:${port}`);
});