import express from 'express';
import cors from 'cors';
import pg from 'pg';
import xmlparser from 'express-xml-bodyparser';
import json2xml from 'json2xml';
import readline from 'readline';
const app = express();
app.use (cors());
app.use (express.json());
app.use (xmlparser());


let applicationType = 'json';

app.use((req, res, next) => {
    if (applicationType === 'xml') {
        applicationType = 'xml';
        res.header('response-type', `application/${applicationType}`);

        xmlparser.toString(req.body, (err, data)=>{
            res.header('content-type', `application/${applicationType}`)
            next();
        });
    }
    next();
});


const databaseConfig = {
    user: 'postgres',
    password: '91172305',
    database: 'mercado',
    host: 'localhost',
    port: 5432
};

const { Pool } = pg;
const connection = new Pool(databaseConfig);

app.get('/produto', async (req, res) => {

    const produto = await connection.query ('select * from produto'); 
    res.send(produto.rows);


})
app.get('/cliente', async (req, res) => {

    const cliente = await connection.query ('select * from cliente'); 
    res.send(cliente.rows);


})

app.delete('/cliente/:id', async (req, res) => { //mudando metodo pra nao dar conflito

    const {id} = req.params; //desestrutura o id
    await connection.query ('delete from cliente where id = $1',[id]); 
    res.sendStatus(204);


})



app.post('/cliente', async (req, res) =>{
    
    try {

        const {nome, cpf} = req.body;

    await connection.query (`INSERT INTO cliente (nome, cpf) VALUES ($1,$2);`,[nome,cpf]) //evitar sql injection, por seguranca do banco
    res.sendStatus(201);

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }

})

app.put('/cliente/:id', async (req, res) =>{ //pra nao ficar chumbado, fazer a adição na mao grande, usa-se o parametro da rota
    
    try {

        const {nome, cpf} = req.body; //envia um corpo na requisição
        const {id} = req.params; //parametro da rota

    await connection.query (`update cliente set nome = $1, cpf = $2 where id = $3;`,[nome,cpf, id]) //evitar sql injection, por seguranca do banco
    res.sendStatus(201); 

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }

})


app.get('/compra_produto', async (req, res) => {

    const compra_produto = await connection.query (`SELECT 
    compra_produto."idDeCompra",
        compra_produto."idProduto",
        compra_produto."precoTotal",
        compra_produto.quantidade AS "qtdProduto",
        produto.nome AS "nomeProduto",
        produto.preco AS "precoProduto",
        compra."idUsuario", 
        cliente.nome AS "clienteNome",
        cliente.cpf AS "clienteCpf"
    
    FROM compra_produto
    JOIN produto 
        ON "idProduto" = produto.id
    JOIN compra
        ON "idDeCompra" = compra.id
    JOIN cliente
        ON "idUsuario" = cliente.id;`); 
        console.log(applicationType);
        console.log(json2xml(compra_produto.rows, { header: true }));
        if (applicationType === 'xml') {
            const resultado = json2xml(compra_produto.rows, { header: true });
            return res.send(resultado);

        }

        res.send(compra_produto.rows);  

        

   

})

app.post('/compra_produto/:id', async (req, res) =>{
    
    try {

        const {idProduto, quantidade} = req.body;
        const {id} = req.params;

        console.log(req.body);
        //const cliente = await connection.query (`select * from cliente where id = $1`,[id]) //evitar sql injection, por seguranca do banco
        const produto = await connection.query (`select * from produto where id = $1`,[idProduto]) //evitar sql injection, por seguranca do banco
        console.log (produto.rows);
        const total = produto.rows[0].preco * quantidade;
        const compra = await connection.query (`insert into compra ("idUsuario") VALUES ($1) RETURNING *;`,[id]);
        const compra_produto = await connection.query (`insert into compra_produto ("idDeCompra","idProduto", "precoTotal", "quantidade") VALUES ($1, $2, $3, $4) RETURNING *;`,[compra.rows[0].id, idProduto, total, quantidade]); 

        res.send(compra_produto.rows[0]); //assim ele devolve um objeto e nao um array


    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }

})

let leitor = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

app.listen(5000, () => {
    
        leitor.question("JSON OR XML\n", function(answer) {
            applicationType = answer; 
            leitor.close();
            console.log('Server running on port 5000');
        });
});



