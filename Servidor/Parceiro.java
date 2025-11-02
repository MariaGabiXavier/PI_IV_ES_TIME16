import java.io.*;
import java.net.*;
import java.util.*;
import java.util.concurrent.Semaphore; 

public class Parceiro{
    private Socket conexao;
    private ObjectInputStream receptor;
    private ObjectOutputStream transmissor;

    private Comunicado proximoComunicado == null;

    private Semaphore mutEx = new Semaphore(1,true) // somente um recurso disponível

    public Parceiro (Socket conexao,
                    ObjectInputStream receptor,
                    ObjectOutputStream transmissor)
                    throws Exception{
        
        if (conexao == null) throw new Exception("Conexao ausente!");
        if(receptor == null) throw new Exception("Receptor ausente!");
        if(transmissor == null) throw new Exception("Transmissor  ausente!");
        
        this.conexao = conexao;
        this.receptor = receptor;
        this.transmissor = transmissor;
    }

    public void receba(Comunicado x) throws Exception{
        //esse metodo ser para transmitir uma mensagem
        //alguem que deseja receber essa mensagem chamará essa função por isso o nome
        try{
            this.transmissor.writeObject(x);
            this.transmissor.flush();
        }
        catch(IOException erro){
            throw new Exception ("Erro de transmissao!");
        }
    }

public Comunicado espie () throws Exception{
    //esse metodo "espia" o proximo comunicado
    try{
        this.mutEx.acquireUninterruptibly(); // somente um acesso permitido
        //area crítica
        if(this.proximoComunicado == null) this.proximoComunicado = (Comunicado) this.receptor.readObject();
        this.mutEx.realease(); //recurso é liberado
        return this.proximoComunicado;
    }
    catch(Exception erro){
        throw new Exception ("Erro de recepcao!");
    }
}

public Comunicado envie() throws Exception{
    //metodo para receber uma mensagem
    //alguem que chama este metodo deseja receber uma mensagem
    try{
        if(this.proximoComunicado==null) this.proximoComunicado = (Comunicado) this.receptor.readObject();
        Comunicado ret = this.proximoComunicado;
        this.proximoComunicado == null;
        return ret;
    }
    catch(Exception erro){
        throw new Exception ("Erro de recepcao!");
    }
}

public void adeus () throw Exception{
    try{
        this.transmissor.close();
        this.receptor.close();
        this.conexao.close();
    }
    catch(Exception erro){
        throw new Exception("Erro de desconexao!");
    }
}
}