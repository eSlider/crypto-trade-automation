package main

import (
	//"github.com/bitfinexcom/bitfinex-api-go/pkg/models/order"
	"github.com/bitfinexcom/bitfinex-api-go/v2/rest"
	"gopkg.in/yaml.v3"
	"io/ioutil"
	"log"
	//"time"
)

type App struct {
	Bitfinex
}

func (a *App) Check(err error) {
	if err != nil {
		log.Fatal(err)
		panic(err)
	}
}

func (a *App) Init() *App {
	data, err := ioutil.ReadFile("config.yml")
	a.Check(err)
	err = yaml.Unmarshal(data, a)
	a.Check(err)
	a.Login()

	// Link to app
	a.Bitfinex.App = a

	return a
}

type Bitfinex struct {
	Key, Secret string
	Client      *rest.Client
	App         *App `yaml:"-"`
}

func (b *Bitfinex) Login() {
	b.Client = rest.NewClient().Credentials(b.Key, b.Secret)
}
func (b *Bitfinex) IsAlive() bool {
	r, err := b.Client.Platform.Status()
	b.App.Check(err)
	return r
}

func main() {
	app := new(App).Init()
	app.Check(nil)
	//
	//// create order
	//response, err := client.Orders.SubmitOrder(&order.NewRequest{
	//	Symbol: "tBTCUSD",
	//	CID:    time.Now().Unix() / 1000,
	//	Amount: 0.02,
	//	Type:   "EXCHANGE LIMIT",
	//	Price:  5000,
	//})
	//
	//if err != nil {
	//	panic(err)
	//}
	//
	//print(response.Status)
}
