package main

type semaphore struct {
	sem chan struct{}
}

func newSemaphore(n int) *semaphore {
	return &semaphore{sem: make(chan struct{}, n)}
}

func (s *semaphore) acquire() {
	s.sem <- struct{}{}
}
func (s *semaphore) release() {
	<-s.sem
}

func main() {

}
