import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { db } from '../config';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { doc, updateDoc, getDoc } from 'firebase/firestore';


export default function MonitorPedidosScreen() {
    const [pedidos, setPedidos] = useState([]);

    const obterProximoStatus = (statusAtual) => {
        const status = ["Aguardando", "Preparando", "A caminho", "Entregue"];
        const indiceAtual = status.indexOf(statusAtual);
        const proximoIndice = (indiceAtual + 1) % status.length;
        return status[proximoIndice];
    };

    const obterProximoStatusPagamento = async (pedido) => {
        // Verifica se o pedido é da coleção correta antes de tentar atualizar
        if (pedido.collection === 'pedidosMoney') {
            // Alterna o status entre "pago" e "pendente"
            const novoStatus = pedido.status === 'Pago' ? 'Pendente' : 'Pago';

            // Atualizar o estado localmente
            const novosPedidos = pedidos.map(p => {
                if (p.id === pedido.id) {
                    return { ...p, status: novoStatus };
                }
                return p;
            });
            setPedidos(novosPedidos);

            // Atualizar no Firestore
            await atualizarStatusPedidoMoneyFirestore(pedido.id, pedido.userId, novoStatus, pedido.collection);
        } else {
            console.log('Alteração de status de pagamento só pode ser feita em pedidos da coleção pedidosMoney.');
        }
    };

    const atualizarStatusNoFirestore = async (pedido) => {
        const pedidoRef = doc(db, "usuarios", pedido.userId, pedido.collection, pedido.id);

        try {
            await updateDoc(pedidoRef, {
                StatusEntrega: pedido.StatusEntrega
            });
            console.log("Status do pedido atualizado com sucesso.");
        } catch (error) {
            console.error("Erro ao atualizar status do pedido:", error);
        }
    };

    const alterarStatusEntrega = async (pedido) => {
        const novoStatus = obterProximoStatus(pedido.StatusEntrega);
        // Atualizar o estado localmente com o novo status
        const novosPedidos = pedidos.map(p => {
            if (p.id === pedido.id) {
                return { ...p, StatusEntrega: novoStatus };
            }
            return p;
        });
        setPedidos(novosPedidos);

        // Atualizar no Firestore com o novo status
        await atualizarStatusNoFirestore({ ...pedido, StatusEntrega: novoStatus });
    };

    const atualizarStatusPedidoMoneyFirestore = async (pedidoId, userId, novoStatus, collection) => {
        const pedidoRef = doc(db, "usuarios", userId, collection, pedidoId);

        try {
            await updateDoc(pedidoRef, {
                status: novoStatus
            });
            console.log("Status de pagamento atualizado com sucesso.");
        } catch (error) {
            console.error("Erro ao atualizar o status de pagamento:", error);
        }
    };



    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "usuarios"), (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    monitorarPedidos(change.doc.id);
                }
            });
        });

        return () => unsubscribe();
    }, []);

    const monitorarPedidos = (userId) => {
        const qPedidos = query(collection(db, "usuarios", userId, "pedidos"),
            where("status", "==", "approved"),
            orderBy("timestamp", "desc"));
        onSnapshot(qPedidos, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const pedido = { id: change.doc.id, ...change.doc.data() };
                    if (pedido.status === "approved") {
                        atualizaPedidos([pedido]);
                    }
                } else if (change.type === "modified") {
                    setPedidos(prevPedidos => prevPedidos.map(pedido =>
                        pedido.id === change.doc.id && change.doc.data().status === "approved" ? { id: change.doc.id, ...change.doc.data() } : pedido));
                } else if (change.type === "removed") {
                    setPedidos(prevPedidos => prevPedidos.filter(pedido => pedido.id !== change.doc.id));
                }
            });
        });

        const atualizaPedidos = (novosPedidos) => {
            setPedidos((prevPedidos) => {
                // Inclui novos pedidos na lista existente
                const pedidosAtualizados = [...prevPedidos, ...novosPedidos];

                // Ordena primeiro por StatusEntrega (colocando "Aguardando" primeiro)
                // e então por timestamp (do mais recente para o mais antigo)
                return pedidosAtualizados.sort((a, b) => {
                    // Comparação de StatusEntrega
                    if (a.StatusEntrega === "Aguardando" && b.StatusEntrega !== "Aguardando") {
                        return -1; // a vem antes de b
                    } else if (a.StatusEntrega !== "Aguardando" && b.StatusEntrega === "Aguardando") {
                        return 1; // b vem antes de a
                    } else {
                        // Se os StatusEntrega são iguais, compara por timestamp
                        return b.timestamp.toMillis() - a.timestamp.toMillis();
                    }
                });
            });
        };

        // Monitorar novos pedidosMoney
        const qPedidosMoney = query(collection(db, "usuarios", userId, "pedidosMoney"), where("Troco", "!=", null));
        onSnapshot(qPedidosMoney, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added" && change.doc.data().Troco) {
                    const pedidoMoney = { id: change.doc.id, ...change.doc.data() };
                    // Agora vamos chamar atualizaPedidos para manter a consistência na ordenação
                    atualizaPedidos([pedidoMoney]);
                }
                // Aqui você pode adicionar lógicas para "modified" e "removed" se necessário
            });
        });
    };



    return (
        <FlatList
            data={pedidos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <View className=" p-4 border-b-8 border-red-800">

                    <View className="flex flex-row pb-1 text-center justify-center">
                        <Text className="pr-1 font-bold text-lg text-center">
                            N. Pedido:
                        </Text>
                        <Text className="text-lg text-center">
                            {item.numpedido}
                        </Text>
                    </View>
                    <View className="flex flex-row pb-1">
                        <Text className="pr-1 font-bold">
                            Data:
                        </Text>
                        <Text>
                            {item.timestamp
                                ? item.timestamp.toDate().toLocaleString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                })
                                : 'Data não disponível'}
                        </Text>
                    </View>

                    <View className="flex flex-row pb-1">
                        <Text className="pr-1 font-bold">
                            Nome do Usuario 01:
                        </Text>
                        <Text className="">
                            {item.NomeDoUsuario}
                        </Text>
                    </View>

                    <View className="flex flex-row pb-1">
                        <Text className="pr-1 font-bold">
                            Nome do Usuario 02:
                        </Text>
                        <Text className="">
                            {item.Nome_2}
                        </Text>
                    </View>

                    <View className="flex flex-col justify-center items-center mt-1 pb-1">
                        <Text className="pr-1 font-bold">
                            Endereço de Entrega
                        </Text>
                        <Text>
                            {item.EnderecoEntrega || 'Pedido para retirar'}
                        </Text>
                    </View>

                    <View className="flex flex-col pb-1 justify-center items-center border rounded-xl my-2">
                        <Text className="pr-1 font-bold text-lg">
                            Status da Entrega
                        </Text>
                        <Text className="font-bold text-lg"
                            style={{ color: item.StatusEntrega === 'Aguardando' ? 'gray' : item.StatusEntrega === 'Preparando' ? 'red' : item.StatusEntrega === 'Entregue' ? 'green' : item.StatusEntrega === 'A caminho' ? 'blue' : 'black' }}>

                            {item.StatusEntrega}
                        </Text>
                        <TouchableOpacity
                            onPress={() => alterarStatusEntrega(item)}
                            className="p-2 rounded-xl bg-cyan-500 my-2">
                            <Text className="text-center font-bold text-white">
                                Mudar Status
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex flex-col justify-center items-center pb-1 border rounded-xl my-2">
                        <Text className="pr-1 font-bold text-lg">
                            Pagamento
                        </Text>
                        <Text className="font-bold text-lg"
                            style={{ color: item.status === 'Pago' ? 'green' : item.status === 'Pendente' ? 'red' : item.status === 'approved' ? 'green' : 'black' }}>
                            {item.status}
                        </Text>
                        {
                            item.collection === 'pedidosMoney' && (
                                <TouchableOpacity
                                    onPress={() => obterProximoStatusPagamento(item)}
                                    className="p-2 rounded-xl bg-cyan-500 my-2">
                                    <Text className="text-center font-bold text-white">
                                        Alterar Pagamento
                                    </Text>
                                </TouchableOpacity>
                            )
                        }
                    </View>

                    <View className="flex flex-row pb-1">
                        <Text className="pr-1 font-bold">
                            Tipo de Pagamento:
                        </Text>
                        <Text>
                            {item.TipoPagamento}
                        </Text>
                    </View>

                    <View className="flex flex-row pb-1">
                        <Text className="pr-1 font-bold">
                            RetiradaEntrega:
                        </Text>
                        <Text >
                            {item.RetiradaEntrega}
                        </Text>
                    </View>

                    <View className="flex flex-row pb-1">
                        <Text className="pr-1 font-bold">
                            Total:
                        </Text>
                        <Text >
                            {item.ValorTotal ? `R$ ${item.ValorTotal.toFixed(2)}` : 'Não informado'}
                        </Text>
                    </View>

                    <View className="flex flex-col pb-1">
                        <Text className="pr-1 font-bold text-lg text-center">
                            Itens do Pedido
                        </Text>
                        <View >
                            {item.itemsDoPedido && item.itemsDoPedido.length > 0 ? (
                                item.itemsDoPedido.map((itemPedido, index) => (
                                    <View key={index}>
                                        <Text className="text-center font-bold">
                                            {itemPedido.title}
                                        </Text>
                                        <Text className="text-center pb-2">
                                            Quantidade: {itemPedido.quantity}
                                        </Text>
                                    </View>
                                ))
                            ) : (
                                <Text>Nenhum item no pedido.</Text>
                            )}
                        </View>
                    </View>
                </View>
            )}
        />

    );
}
