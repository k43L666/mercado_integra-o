CREATE TABLE "compra_produto" (
	"id" serial NOT NULL,
	"idDeCompra" integer NOT NULL,
	"idProduto" integer NOT NULL,
	"precoTotal" integer NOT NULL,
	"quantidade" integer NOT NULL DEFAULT '1',
	CONSTRAINT "compra_produto_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "compra" (
	"id" serial NOT NULL,
	"idUsuario" integer NOT NULL,
	"dataDeCompra" timestamp with time zone NOT NULL DEFAULT 'now()',
	CONSTRAINT "compra_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "produto" (
	"id" serial NOT NULL,
	"nome" varchar(255) NOT NULL,
	"preco" integer NOT NULL,
	CONSTRAINT "produto_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "cliente" (
	"id" serial NOT NULL,
	"nome" varchar(255) NOT NULL,
	"cpf" varchar(255) NOT NULL UNIQUE,
	CONSTRAINT "cliente_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



ALTER TABLE "compra_produto" ADD CONSTRAINT "compra_produto_fk0" FOREIGN KEY ("idDeCompra") REFERENCES "compra"("id");
ALTER TABLE "compra_produto" ADD CONSTRAINT "compra_produto_fk1" FOREIGN KEY ("idProduto") REFERENCES "produto"("id");

ALTER TABLE "compra" ADD CONSTRAINT "compra_fk0" FOREIGN KEY ("idUsuario") REFERENCES "cliente"("id");






INSERT INTO produto (nome, preco) VALUES ('pão', 10), ('biscoito', 3), ('mostarda', 666), ('ketchup', 5);
INSERT INTO cliente (nome, cpf) VALUES (${nome},${cpf});

SELECT 
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
    ON "idUsuario" = cliente.id;




