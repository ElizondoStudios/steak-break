import { StyleSheet, Image, View, Dimensions, Text, TouchableOpacity, FlatList } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function HomeScreen() {

  const [menu, setMenu]= useState([]);
  const [orden, setOrden]= useState([]);
  const snapPoints = ['8%', '90%'];
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [checkout, setCheckout]= useState(false);
  const numOrden= useRef(Date.now()+Math.floor((Math.random()*100)))
  const [segundosParaConfirmar, setSegundosParaConfirmar]= useState(60)
  const [intervaloConfirmacion, setIntervaloConfirmacion]= useState(null)
  const [ordenConfirmada, setOrdenConfirmada]= useState(false)
  const [horaEntrega, setHoraEntrega]= useState(null)
  const [ordenesActivas, setOrdenesActivas]= useState([])
  const [verOrdenesActivas, setVerOrdenesActivas]= useState(false)

  useEffect(() => {
    setMenu(require('../../assets/data/menu.json'));
  }, [])

  useEffect(() => {
    console.log(orden)
  }, [orden])

  const agregarAOrden= (producto: any)=>{
    setOrden(prevOrden => {
      const indice= prevOrden.findIndex(el => el.id==producto.id)
      if(indice==-1){
        return [...prevOrden, {...producto, cantidad: 1}]
      }else{
        prevOrden[indice].cantidad++
        return [...prevOrden]
      }
    })
  }

  const formatCurrency= (value: number)=>{
    return new Intl.NumberFormat('es-MX', {style: 'currency', currency: 'MXN'}).format(value)
  }

  useEffect(() => {
    if(checkout){
      setIntervaloConfirmacion(setInterval(() => {
        if(checkout){
          setSegundosParaConfirmar(prevSegundos => prevSegundos-1)
        }
      }, 1000))  
    }else{
      clearInterval(intervaloConfirmacion)
      setIntervaloConfirmacion(null)
      setSegundosParaConfirmar(30)
    }
  }, [checkout])

  useEffect(() => {
    if(segundosParaConfirmar===0){
      setOrdenConfirmada(true)
      setHoraEntrega(new Date(Date.now()+(1000*60*20)))
      setOrdenesActivas(prevOrdenes => [...prevOrdenes, {numOrden: numOrden.current, horaEntrega: new Date(Date.now()+(1000*60*20))}])
    }
  }, [segundosParaConfirmar])

  const menuItem: any = (item: any)=>(
    <View style={styles.menuItem}>
      <Text style={{fontFamily: 'GrahmRough', color: '#ffac00', fontSize: 40}}>{item.categoria}</Text>
      {
        item.detalles!="" &&
        <Text style={{fontFamily: 'GrahmRough', color: '#ffac00', fontSize: 26}}>({item.detalles})</Text>
      }
      {
        item.items.map((product: any) =>(
          <View style={styles.product} key={product.id}>
            <View style={{width: '85%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
              <Text style={{fontFamily: 'ChauPhilomene', color: '#fff', fontSize: 27}}>{product.nombre}</Text>
              <Text style={{fontFamily: 'ChauPhilomene', color: '#ffac00', fontSize: 27}}>$ {product.precio}</Text>
            </View>
            <TouchableOpacity
              style={{alignItems: 'center', justifyContent: 'center'}} 
              onPress={() => {
                agregarAOrden(product)
              }}
            >
              <Ionicons name={'bag-add'} size={32} color={'#ffac00'}/>
            </TouchableOpacity>
          </View>
        ))
      }
    </View>
  )

  return (
    <GestureHandlerRootView>
      <FlatList 
        contentContainerStyle={styles.mainContainer}
        data={menu}
        renderItem={({item}) => menuItem(item)}
        ListHeaderComponent={
          <View style={{width: '100%', alignItems: 'flex-end', justifyContent: 'center'}}>
            {
              ordenesActivas.length>0 &&
              <TouchableOpacity
                style={{paddingHorizontal: 21}}
                onPress={() => {
                  setVerOrdenesActivas(true)
                }}
              >
                <Ionicons name={'receipt-outline'} size={32} color={'#ffac00'}/>
              </TouchableOpacity>
            }
            <Image 
              source={require('../../assets/images/menu.png')}
              style={{width: Dimensions.get("window").width*0.8, resizeMode: 'contain', marginHorizontal: Dimensions.get("window").width*0.1}}
            ></Image>
          </View>
        }
      ></FlatList>
      {
        orden.length>0 &&
        <BottomSheet
          snapPoints={snapPoints}
          index={0}
          backgroundStyle={{backgroundColor: '#333'}}
          handleIndicatorStyle={{backgroundColor: '#ffac00'}}
          ref={bottomSheetRef}
        >
          <View style={{flex: 0.85, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{fontFamily: 'GrahmRough', color: '#ffac00', fontSize: 40}}>Orden</Text>
            <FlatList 
              data={orden}
              renderItem={({item}) => (
                <View style={styles.product}>
                  <View style={{width: '72%'}}>
                    <Text style={{fontFamily: 'ChauPhilomene', color: '#fff', fontSize: 27}}>{item.nombre}</Text>
                    <Text style={{fontFamily: 'ChauPhilomene', color: '#ffac00', fontSize: 27}}>{item.cantidad} x {formatCurrency(item.precio)}</Text>
                  </View>
                  <View style={{width: '22%', flexDirection: 'row'}}>
                    <TouchableOpacity
                      style={{alignItems: 'center', justifyContent: 'center'}} 
                      onPress={() => {
                        setOrden(prevOrden => {
                          const indice= prevOrden.findIndex(el => el.id==item.id)
                          if(indice==-1){
                            return [...prevOrden]
                          }else{
                            if(prevOrden[indice].cantidad==1){
                              prevOrden.splice(indice, 1)
                            }else{
                              prevOrden[indice].cantidad--
                            }
                            return [...prevOrden]
                          }
                        })
                      }}
                    >
                      <Ionicons name={'remove-circle-outline'} size={32} color={'#ffac00'}/>
                    </TouchableOpacity>
                    <Text style={{fontFamily: 'ChauPhilomene', color: '#ffac00', fontSize: 22, marginHorizontal: 5}}>
                      {item.cantidad}
                    </Text>
                    <TouchableOpacity
                      style={{alignItems: 'center', justifyContent: 'center'}} 
                      onPress={() => {
                        setOrden(prevOrden => {
                          const indice= prevOrden.findIndex(el => el.id==item.id)
                          if(indice==-1){
                            return [...prevOrden]
                          }else{
                            prevOrden[indice].cantidad++
                            return [...prevOrden]
                          }
                        })
                      }}
                    >
                      <Ionicons name={'add-circle-outline'} size={32} color={'#ffac00'}/>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              contentContainerStyle={{width: '100%', flex: 1, flexGrow: 1}}
            ></FlatList>
          </View>
          <View style={{width: '100%', flex: 0.15, paddingHorizontal: 12}}>
            <Text style={{fontFamily: 'GrahmRough', color: '#ffac00', fontSize: 40, textAlign: 'right'}}>
              Total: {formatCurrency(orden.reduce((acc, el) => acc+(el.precio*el.cantidad), 0))}
            </Text>
            <TouchableOpacity
              style={{width: '90%', marginHorizontal: '5%', alignItems: 'center', justifyContent: 'center', padding: 10, backgroundColor: '#ffac00', borderRadius: 10, marginTop: 10}}
              onPress={() => {
                setCheckout(true)
              }}
            >
              <Text style={{fontFamily: 'GrahmRough', color: '#333', fontSize: 30}}>Pagar</Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>
      }
      {
        checkout &&
        <BottomSheet
          snapPoints={['100%']}
          index={0}
          backgroundStyle={{backgroundColor: '#333'}}
          handleIndicatorStyle={{backgroundColor: '#333'}}
        >
          <View style={{flex: 1, padding: 12}}>
          <View style={{width: '100%', alignItems: 'flex-start', justifyContent: 'center'}}>
            <TouchableOpacity
              onPress={() => {
                setCheckout(false)
                if(ordenConfirmada){
                  setOrden([])
                  setOrdenConfirmada(false)
                  setHoraEntrega(null)
                  numOrden.current= Date.now()+Math.floor((Math.random()*100))
                }
              }}
              style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}
            >
              <Ionicons name={'arrow-back-outline'} size={32} color={'#ffac00'}/>
              <Text style={{fontFamily: 'ChauPhilomene', color: '#ffac00', fontSize: 20}}>{ordenConfirmada? 'Realizar Nuevo Pedido':'Modificar Orden'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={{fontFamily: 'GrahmRough', color: '#ffac00', fontSize: 35, marginTop: 20}}>Paga con el siguiente número de órden en caja</Text>
          <Text style={{fontFamily: 'GrahmRough', color: '#fff', fontSize: 25, width: '100%', textAlign: 'center'}}>{numOrden.current}</Text>
          <View style={{width: '100%', alignItems: 'center', justifyContent: 'center'}}>
            <Image
              source={require('../../assets/images/qr.png')}
              style={{maxWidth: Dimensions.get('window').width*0.5, height: Dimensions.get('window').height*0.1, resizeMode: 'contain',}}
            ></Image>
          </View>
          <Text style={{fontFamily: 'GrahmRough', color: '#ffac00', fontSize: 35, marginTop: 20}}>Resumen de la Órden</Text>
          <FlatList 
            data={orden}
            renderItem={({item}) => (
              <View style={styles.product}>
                <View style={{width: '72%'}}>
                  <Text style={{fontFamily: 'ChauPhilomene', color: '#fff', fontSize: 22}}>{item.nombre}</Text>
                  <Text style={{fontFamily: 'ChauPhilomene', color: '#ffac00', fontSize: 22}}>{item.cantidad} x {formatCurrency(item.precio)}</Text>
                </View>
                <View style={{width: '25%', flexDirection: 'row'}}>
                  <Text style={{fontFamily: 'ChauPhilomene', color: '#ffac00', fontSize: 22}}>{formatCurrency(item.precio*item.cantidad)}</Text>
                </View>
              </View>
            )}
            contentContainerStyle={{width: '100%', flex: 1, flexGrow: 1}}
          ></FlatList>
          {
            !ordenConfirmada?
            <>
              <Text style={{fontFamily: 'GrahmRough', color: '#aaa', fontSize: 15, textAlign: 'center'}}>
                Si lo deseas aún puedes modificar tu orden
              </Text>
              <Text style={{fontFamily: 'GrahmRough', color: '#aaa', fontSize: 15, textAlign: 'center'}}>
                Tu orden va  ser confirmada después de: {segundosParaConfirmar}s
              </Text>
            </>:
            <>
              <Text style={{fontFamily: 'GrahmRough', color: '#ffac00', fontSize: 20, textAlign: 'center'}}>
                Orden Confirmada. Gracias por tu compra
              </Text>
              <Text style={{fontFamily: 'GrahmRough', color: '#ffac00', fontSize: 20, textAlign: 'center'}}>
                Tu orden estará lista a las {horaEntrega.getHours()}:{horaEntrega.getMinutes()}
              </Text>
            </>
          }
          <Text style={{fontFamily: 'GrahmRough', color: '#ffac00', fontSize: 40, textAlign: 'right'}}>
            Total: {formatCurrency(orden.reduce((acc, el) => acc+(el.precio*el.cantidad), 0))}
          </Text>
          </View>
        </BottomSheet>
      }
      {
        verOrdenesActivas &&
        <BottomSheet
          snapPoints={['100%']}
          index={0}
          backgroundStyle={{backgroundColor: '#333'}}
          handleIndicatorStyle={{backgroundColor: '#333'}}
        >
          <View style={{flex: 1, padding: 12}}>
            <View style={{width: '100%', alignItems: 'flex-start', justifyContent: 'center'}}>
              <TouchableOpacity
                onPress={() => {
                  setVerOrdenesActivas(false)
                }}
                style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}
              >
                <Ionicons name={'arrow-back-outline'} size={32} color={'#ffac00'}/>
                <Text style={{fontFamily: 'ChauPhilomene', color: '#ffac00', fontSize: 20}}>Órdenes Activas</Text>
              </TouchableOpacity>
            </View>
            <Text style={{fontFamily: 'GrahmRough', color: '#ffac00', fontSize: 35, marginTop: 20}}>Órdenes Activas</Text>
            <FlatList 
              data={ordenesActivas}
              renderItem={({item}) => (
                <View style={styles.product}>
                  <View style={{width: '100%'}}>
                    <Text style={{fontFamily: 'ChauPhilomene', color: '#fff', fontSize: 22}}>Orden: {item.numOrden}</Text>
                    <Text style={{fontFamily: 'ChauPhilomene', color: '#ffac00', fontSize: 22}}>Entrega: {item.horaEntrega.getHours()}:{item.horaEntrega.getMinutes()}</Text>
                  </View>
                </View>
              )}
              contentContainerStyle={{width: '100%', flex: 1, flexGrow: 1}}
            ></FlatList>
          </View>
        </BottomSheet>
      }
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  mainContainer:{
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
    paddingBottom: (Dimensions.get("window").height*0.1)+10
  },
  menuItem: {
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  product: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14
  }
});
