import Link from "next/link";
import Image from "next/image";
import styles from "./mark.module.css";

export function Mark() {
  return <Link href="/" className={styles.logo} aria-label="0xAlex Check home"><Image src="/0x-alex.png" width={32} height={32} alt="Pixel-art portrait of Alex" priority /><i><b>0xAlex</b><br />Check</i></Link>;
}
