import { useState, useEffect } from "react";

function Conversorcambio () {
  const [valor, setValor] = useState ("100");
  const [moedas, setMoedas] = useState ({});
  const [moedaDe, setMoedaDe] = useState ("BRL");
  const [moedaPara, setMoedaPara] = useState ("USD");
  const [resultado, setResultado] = useState (null);
  const [carregando, setCarregando] = useState (false);
  const [erro, setErro] = useState (null);

  function trocarMoedas() {
  setMoedaDe(moedaPara);
  setMoedaPara(moedaDe);
  setResultado(null);
}

  useEffect(() => {
    async function buscarMoedas() {
      const resposta = await fetch('https://api.frankfurter.dev/v1/currencies');
      const dados = await resposta.json();
      setMoedas(dados);
    }

    buscarMoedas();
  }, []);

  async function aoConverter (evento) {
    evento.preventDefault();
    setCarregando(true);
    setErro(false);
    setResultado(null);

    try {
      const resposta = await fetch (
        `https://api.frankfurter.dev/v1/latest?amount=${valor}&from=${moedaDe}&to=${moedaPara}`
      );
      const dados = await resposta.json();
      const valorConvertido = dados.rates[moedaPara];
      const taxa = valorConvertido / dados.amount;

      setResultado({
         valorConvertido,
         taxa,
         data: dados.date,
      });
    } catch (erroRecebido) {
      setErro("Não consegui converter, tente de novo");
    } finally{
      setCarregando(false);
    }
  }

  return (
    <div className="cartao">
      <div className="topo">
        <h1>Casa de Câmbio</h1>
        <p className="subtitulo">Troque seu dinheiro pelo valor justo</p>
      </div>

      <form onSubmit={aoConverter}>
        <div className="campo">
          <label htmlFor="valor">Quantia:</label>
          <input 
          type="number" 
          id="valor" 
          value={valor}
          onChange={(evento) => setValor(evento.target.value)}
          min="0"
          step="0.01"
          />
        </div>

        <div className="linha-moedas">
          <div className="campo">
            <label htmlFor="de">De:</label>
            <select id="de" value={moedaDe} onChange={(evento) => setMoedaDe(evento.target.value)}>
              {Object.entries(moedas).map(([codigo, nome]) => (
                <option key={codigo} value={codigo}>{codigo} - {nome}</option>
              ))}
            </select>                     
        </div>

        <button type="button" className="botao-trocar" onClick={trocarMoedas} aria-label="Trocar moedas">
         ⇄
        </button>

        <div className="campo">
          <label htmlFor="para">Para:</label>
          <select id="para" value={moedaPara} onChange={(evento) => setMoedaPara(evento.target.value)}>
              {Object.entries(moedas).map(([codigo, nome]) => (
                <option key={codigo} value={codigo}>{codigo} — {nome}</option>
              ))}
          </select>    
        </div>
      </div>

        <button type="submit" className="converter" disabled={carregando}>
          {carregando ? "Convertendo" : "Converter"}
          {carregando && <span className="spinner"></span>}
        </button>
      </form>

      {erro && <p className="erro">{erro}</p>}

      {resultado &&  (
        <div className="resultado">
          <p className="valor-resultado">
            {resultado.valorConvertido.toFixed(2)} {moedaPara}
          </p>
          <p className="taxa">
            1 {moedaDe} = {resultado.taxa.toFixed(4)} {moedaPara} · atualizado em {resultado.data}
          </p>
        </div>  
      )}

      <p className="rodape">Taxas fornecidas pela Frankfurter API</p>
    </div>
  );
}

export default Conversorcambio;