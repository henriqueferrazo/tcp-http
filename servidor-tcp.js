const net = require("net");
const fs = require("fs");
const { decode } = require("punycode");
const { StringDecoder } = require("string_decoder");
const decoder = new StringDecoder('utf8');
const port = 4002;
const host = "127.0.0.1";

const arquivos = "./public/";

const splitando = (splitLine) => {
    let splita = splitLine.toString().split(" ");
    let objeto = {
        method: splita[0],
        path: splita[1],
    };

    return objeto;
};

const splitCorpo = (splitLien) => {
    let splitandoCorpoRequest = splitLien.toString().split('\r\n');
    let ultimoIndex = splitandoCorpoRequest[splitandoCorpoRequest.length - 1];
    return ultimoIndex;
}

const appendDataFile = async (path, data) => {
    await fs.promises.appendFile(path, data);
    return await fs.promises.readFile(path);
}

const server = net.createServer((socket) => {
    console.log(
        `(${socket.remoteAddress} : ${socket.remotePort}) conectou `
    );

    socket.on("data", (data) => {
        let dado = data.toString();
        let objeto = splitando(dado);
        console.log(dado);
        let body = splitCorpo(dado);

        console.log(splitando(dado));
        if (objeto.path === '/grava') {
            if (objeto.method == 'POST') {
                let nomeDoArquivo = body.split("&")[0].split("=")[1];
                let conteudo =  decoder.write(body.split("&")[1]);
                // let test = decode.end(body.split("&").split("="));

                appendDataFile(arquivos + nomeDoArquivo, conteudo).then((fileContent) => {
                    socket.write("HTTP/1.1 301 Found\r\n");
                    socket.write("Location: /");
                    socket.end();
                })
            }
        } else if (!fs.existsSync(arquivos + objeto.path)) {
            socket.write('HTTP/1.1 404 NOT FILE\r\n\r\n')
            socket.end();
        } else {
            fs.readFile(arquivos + objeto.path, (err, data) => {
                if (objeto.path == "/") {

                    let filesLink = "<ul>";
                    socket.write('HTTP/1.1 200 OK\r\n');
                    socket.write("Content-type: text/html\r\n\r\n");
                    let filesList = fs.readdirSync("./public");
                    filesList.forEach(el => {
                        if (fs.statSync("./public/" + el).isFile()) {
                            filesLink += `<br/><li><a href='${el}'>
                                ${el}
                            </a></li>` ;
                        }
                    });

                    filesLink += "</ul>";
                    let form = `<form action='/grava' method='post'><br/>
                    <input id='nameArquivo' name='arquvivo'  type='text'><br><br>
                    <textarea id="w3review" name="w3review" rows="4" cols="50">
                    </textarea>
                    <input type='submit'>
                    </form>\r\n`;

                    socket.write("<h1>Lista de arquivos:</h1> " + filesLink + form);
                    socket.end();

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
            `(${socket.remoteAddress} : ${socket.remotePort}) desconectou`
        );
    });
});

server.listen(port, host, () => {
    console.log(`Servidor iniciado em ${host}:${port}`);
});