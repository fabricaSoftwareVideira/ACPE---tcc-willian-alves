import React from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';

interface FileViewDrawerProps {
  drawerVisibleView: boolean;
  setDrawerVisibleView: (open: boolean) => void;
  pdfUrl: string | null;
  pdfLoading: boolean;
  setPdfLoading: (loading: boolean) => void;
}

const FileViewDrawer: React.FC<FileViewDrawerProps> = ({
  drawerVisibleView,
  setDrawerVisibleView,
  pdfUrl,
  pdfLoading,
  setPdfLoading
}) => {
  return (
    <Drawer open={drawerVisibleView}>
      <DrawerContent className="h-80% ">
        <DrawerHeader>
          <DrawerTitle>Visualize seu arquivo</DrawerTitle>
        </DrawerHeader>
        <div>
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              width="100%"
              height="600px"
              title="PDF Viewer"
              onLoad={() => setPdfLoading(false)}
              style={{ display: pdfLoading ? 'none' : 'block' }}
            />
          ) : (
            <div className="h-full w-full flex justify-center items-center"><LoadingSpinner className="bg-dark" /></div>
          )}
          {pdfLoading && (
            <div className="h-full w-full flex justify-center items-center"><LoadingSpinner className="bg-dark" /></div>
          )}
        </div>
        <DrawerFooter>
          <DrawerClose>
            <Button variant="outline" onClick={() => { setDrawerVisibleView(false) }}>Cancelar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default FileViewDrawer; 