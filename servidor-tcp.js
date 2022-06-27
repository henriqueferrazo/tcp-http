const net = require("net");
const fs = require("fs");

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
    let ultimaPalavraArray = ultimoIndex.split('=');
    let ultimaPalavra = ultimaPalavraArray[ultimaPalavraArray.length - 1];
    return ultimaPalavra;

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
        if (!fs.existsSync(arquivos + dado.split(" ")[1])) {
            socket.write('HTTP/1.1 404 NOT FILE\r\n\r\n')
            socket.end();
        } else {

            fs.readFile(arquivos + objeto.path, (err, data) => {
                if (objeto.path == "/") {

                    let filesLink = "<ul>";
                    socket.write('HTTP/1.1 200 OK\r\n\r\n');
                    let filesList = fs.readdirSync("./public");
                    filesList.forEach(el => {
                        if (fs.statSync("./public/" + el).isFile()) {
                            filesLink += `<br/><li><a href='${el}'>
                                ${el}
                            </a></li>` ;
                        }
                    });

                    filesLink += "</ul>";
                    let form = `<form method='post'><br/>
                    <input id='nameArquivo' name='arquvivo'  type='text'>
                    <input type='submit'>
                    </form>`;
                    console.log(splitCorpo(dado));
                    socket.write("<h1>Lista de arquivos:</h1> " + filesLink + form);
                    if (objeto.method == 'POST') {
                        const appendDataFile = async (path, data) => {
                            await fs.promises.appendFile(path, data);
                            const buff = await fs.promises.readFile(path);
                            const content = buff.toString()
                            console.log(`Content : ${content}`)
                        }
                        appendDataFile(arquivos + body, 'Hello Word!!')
                    }
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

const port = 4002;
const host = "127.0.0.1";

server.listen(port, host, () => {
    console.log(`Servidor iniciado em ${host}:${port}`);
});