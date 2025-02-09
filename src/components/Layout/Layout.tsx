import Footer from "./Footer/Footer"
import Header from "./Header/Header"

const Layout = (props: {
  children: React.ReactNode
}) => {
  return (
    <div>
      <Header />
      
      <main className="main">
        {props.children}
      </main>
      
      <Footer />
    </div>
  )
}

export default Layout
