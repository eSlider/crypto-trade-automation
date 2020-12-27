package main

import (
	"testing"
)

func TestBitfinex_Login(t *testing.T) {
	app := new(App).Init()
	app.Check(nil)

	if !app.Bitfinex.IsAlive() {
		t.Fatalf("Can't get status")
	}
	// TODO:
	// * Get margin positions
}
